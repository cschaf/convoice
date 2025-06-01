// src/application/repositories/IMemberRepository.js
import Member from '../../domain/entities/Member.js';

/**
 * Interface for accessing member data.
 */
export class IMemberRepository {
    /**
     * Retrieves all members.
     * @returns {Promise<Member[]>} A promise that resolves to an array of Member instances.
     */
    async getAllMembers() {
        throw new Error('Method not implemented: getAllMembers');
    }
}
