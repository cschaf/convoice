// src/infrastructure/data/JsonMemberRepository.js
import { IMemberRepository } from '../../application/repositories/IMemberRepository.js';
import Member from '../../domain/entities/Member.js';
import membersData from '../../data/members.json' assert { type: "json" }; // Direct import

export class JsonMemberRepository extends IMemberRepository {
    constructor() {
        super();
        // Basic validation
        if (!Array.isArray(membersData)) {
            throw new Error("JsonMemberRepository: Invalid or missing members.json data. Expected an array.");
        }
        // Optional: more detailed validation of membersData items
        if (!membersData.every(member => member && typeof member.name === 'string' && typeof member.birthday === 'string')) {
            console.warn("JsonMemberRepository: Some items in members.json may be missing 'name' or 'birthday' or are not structured as expected.");
        }
    }
    /**
     * Retrieves all members from members.json.
     * @returns {Promise<Member[]>} A promise that resolves to an array of Member instances.
     */
    async getAllMembers() {
        // membersData is already loaded.
        // The Member entity constructor handles auto-ID generation if 'id' is not in raw data.
        return membersData.map(rawMember => {
            // Ensure 'id' is passed as null if undefined or not present, so entity's default works.
            const id = rawMember.id !== undefined ? rawMember.id : null;
            return new Member(rawMember.name, rawMember.birthday, id);
        });
    }
}
