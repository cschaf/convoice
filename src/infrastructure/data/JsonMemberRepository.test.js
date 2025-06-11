import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JsonMemberRepository } from './JsonMemberRepository.js';
import Member from '../../domain/entities/Member.js';

// Mock the members.json data
const mockMembersData = [
  { id: 'm1', name: 'Alice Wonderland', birthday: '1990-03-15' },
  { name: 'Bob The Builder', birthday: '1985-07-20' }, // No ID
  { id: 'm3', name: 'Charlie Brown', birthday: '2000-11-05' },
];
vi.mock('../../data/members.json', () => ({
  default: [
    { id: 'm1', name: 'Alice Wonderland', birthday: '1990-03-15' },
    { name: 'Bob The Builder', birthday: '1985-07-20' }, // No ID
    { id: 'm3', name: 'Charlie Brown', birthday: '2000-11-05' },
  ],
}));

const mockEmptyMembersData = [];


describe('JsonMemberRepository', () => {
  let repository;

  beforeEach(async () => {
    // Reset modules before each test to ensure fresh imports with specific mocks
    vi.resetModules();
    // Re-apply the default global mock after reset if needed for most tests,
    // or ensure each test sets up its required mock.
    // For this file, the global vi.mock should be re-evaluated after resetModules.
    // Dynamically import and create repository instance for each test
    const { JsonMemberRepository: Repo } = await import('./JsonMemberRepository.js');
    repository = new Repo();
    vi.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console.warn
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore spies
    // vi.resetModules() is in beforeEach, so modules are reset for the next test.
  });


  describe('getAllMembers', () => {
    it('should return an array of Member instances from members.json data', async () => {
      const { default: MemberEntity } = await import('../../domain/entities/Member.js?v=instancecheck' + Date.now());
      // Ensure the mock is active for this instance of the repository
      // This might require re-importing or ensuring the mock is applied before instantiation.
      // If JsonMemberRepository imports membersData at module level, vi.mock should handle it.
      // Forcing re-import for safety in test if needed:
      // const { JsonMemberRepository: FreshRepository } = await import('./JsonMemberRepository.js');
      // const freshRepo = new FreshRepository();
      // const members = await freshRepo.getAllMembers();

      const members = await repository.getAllMembers();

      expect(members).toBeInstanceOf(Array);
      expect(members.length).toBe(mockMembersData.length);
      members.forEach(member => expect(member).toBeInstanceOf(MemberEntity));

      // Check mapping correctness
      const alice = members.find(m => m.name === 'Alice Wonderland');
      expect(alice).toBeDefined();
      expect(alice.id).toBe('m1');
      expect(alice.birthday).toBe('1990-03-15');

      const bob = members.find(m => m.name === 'Bob The Builder');
      expect(bob).toBeDefined();
      expect(bob.id).toMatch(/^member-Bob-The-Builder-/); // Auto-generated ID
      expect(bob.birthday).toBe('1985-07-20');
    });

    it('should return an empty array if members.json data is empty', async () => {
      vi.resetModules(); // Ensure a clean slate for this specific mock
      // Need to change the mock for this specific test case
      vi.doMock('../../data/members.json', () => ({
        default: mockEmptyMembersData,
      }));
      // Re-import the module to get the new mock
      const { JsonMemberRepository: FreshRepository } = await import('./JsonMemberRepository.js?v=empty'); // Bust cache
      const freshRepo = new FreshRepository(); // Constructor will use the new mock

      const members = await freshRepo.getAllMembers();
      expect(members).toBeInstanceOf(Array);
      expect(members.length).toBe(0);

      // Restore original mock for other tests if necessary, or use vi.resetModules() in afterEach.
      // For simplicity, if this is the last test manipulating this mock, it might not be needed.
      // However, good practice is to clean up:
      vi.doUnmock('../../data/members.json');
    });

    it('should warn if member data items are malformed (constructor test)', async () => {
        vi.resetModules(); // Ensure a clean slate for this specific mock
        const consoleWarnSpy = vi.spyOn(console, 'warn'); // Spy before import

        // Mock data that will cause a warning in the constructor
        const malformedDataForConstructor = [{ name: "Bad Member", birthday: 123 }]; // birthday not a string
        vi.doMock('../../data/members.json', () => ({
            default: malformedDataForConstructor
        }));

        // Dynamically import the repository; it will use the mock defined by vi.doMock
        const { JsonMemberRepository: RepoWithBadData } = await import('./JsonMemberRepository.js?v=malformed' + Date.now()); // Bust cache

        new RepoWithBadData(); // Instantiate to trigger console.warn in constructor

        expect(consoleWarnSpy).toHaveBeenCalledWith("JsonMemberRepository: Some items in members.json may be missing 'name' or 'birthday' or are not structured as expected.");

        vi.doUnmock('../../data/members.json'); // Cleanup
    });

  });
});
