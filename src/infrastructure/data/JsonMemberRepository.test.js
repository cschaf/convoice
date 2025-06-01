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
  default: mockMembersData,
}));

const mockEmptyMembersData = [];


describe('JsonMemberRepository', () => {
  let repository;

  beforeEach(() => {
    // No need to reset mocks defined with vi.mock at top level for each test,
    // unless we change the mock content per test using vi.doMock.
    // For this case, a single mock is fine.
    repository = new JsonMemberRepository();
     vi.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console.warn
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  describe('getAllMembers', () => {
    it('should return an array of Member instances from members.json data', async () => {
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
      members.forEach(member => expect(member).toBeInstanceOf(Member));

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
      // Need to change the mock for this specific test case
      vi.doMock('../../data/members.json', () => ({
        default: mockEmptyMembersData,
      }));
      // Re-import the module to get the new mock
      const { JsonMemberRepository: FreshRepository } = await import('./JsonMemberRepository.js');
      const freshRepo = new FreshRepository(); // Constructor will use the new mock

      const members = await freshRepo.getAllMembers();
      expect(members).toBeInstanceOf(Array);
      expect(members.length).toBe(0);

      // Restore original mock for other tests if necessary, or use vi.resetModules() in afterEach.
      // For simplicity, if this is the last test manipulating this mock, it might not be needed.
      // However, good practice is to clean up:
      vi.doUnmock('../../data/members.json');
    });

    it('should warn if member data items are malformed (constructor test)', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn');
        vi.doMock('../../data/members.json', () => ({
            default: [{ name: "Only Name" }] // Malformed data
        }));

        // Re-import and instantiate to trigger constructor validation with the new mock
        // Vitest's vi.resetModules() might be needed if the module was already loaded.
        // Forcing re-evaluation of the module that imports members.json
        return new Promise(async (resolve) => {
            await vi.dynamicImport('./JsonMemberRepository.js?t=' + Date.now()); // Force re-import
            // Instantiation happens inside this dynamic import scope if module exports the class directly
            // This test setup for constructor validation with vi.doMock is tricky for static imports.
            // A simpler way is to test the constructor behavior by directly providing malformed data if possible,
            // or by ensuring the initial mock for the describe block covers one malformed item.

            // The constructor warning is about 'name' or 'birthday' string types.
            // The provided mock [{ name: "Only Name"}] is missing 'birthday'.
            // The warning check in the constructor of JsonMemberRepository is:
            // !membersData.every(member => member && typeof member.name === 'string' && typeof member.birthday === 'string')
            // This will trigger the warning.

            // Let's assume the main mock `mockMembersData` doesn't trigger the warning.
            // To test the warning, we need to ensure the constructor runs with bad data.
            // The warning spy is already active.

            // If JsonMemberRepository has already been imported at the top of the test file,
            // its membersData is already bound. vi.doMock is for dynamic imports or re-imports.
            // For this specific constructor test, it's simpler to ensure the initial mock used by 'repository'
            // or a specific instance has malformed data.
            // Let's test this by temporarily setting a bad mock, re-importing, and instantiating.
            // This is complex. A more straightforward test is to assume the global mock can be varied.
            // For now, this test relies on the default mock not having this specific malformation for other tests to pass cleanly.
            // If the default mock *did* have a malformed entry that only warns, other tests would still pass.

            // The console.warn spy is already set up in beforeEach.
            // The constructor of 'repository' would have run with 'mockMembersData'.
            // If 'mockMembersData' is perfectly fine, no warning.
            // Let's assume 'mockMembersData' is fine.
            // We'll test the constructor's robustness against bad import directly.
            // This is more of a test on how the class behaves if the JSON module itself is bad.
            // The current JsonMemberRepository constructor has a basic check: `if (!Array.isArray(membersData))`
            // and `if (!membersData.every(member => member && typeof member.name === 'string' && typeof member.birthday === 'string'))`

            // Test the actual warning condition from the constructor
            const malformedDataForConstructor = [{ name: "Bad Member", birthday: 123 }]; // birthday not a string
             vi.doMock('../../data/members.json', () => ({
                default: malformedDataForConstructor
            }));
            const { JsonMemberRepository: RepoWithBadData } = await import('./JsonMemberRepository.js?v=' + Date.now()); // Bust cache
            new RepoWithBadData(); // Instantiate to trigger console.warn in constructor
            expect(consoleWarnSpy).toHaveBeenCalledWith("JsonMemberRepository: Some items in members.json may be missing 'name' or 'birthday' or are not structured as expected.");
            vi.doUnmock('../../data/members.json'); // Cleanup
            resolve(); // End async test
        });
    });

  });
});
