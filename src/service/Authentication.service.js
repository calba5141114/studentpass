const argon2 = require('argon2');
const JsonWebTokenGenerator = require('./JsonWebTokenGenerator.service');
const IdentityRepo = require('../repo/Identity.repo');

class Authentication {

    /**
     * @typedef {Object} PublicIdentityTokenObject
     * @property {string} token - JSON Web Token
     */

    /**
     * Create New Identity
     * @param {string} name 
     * @param {string} email 
     * @param {string} schoolIssuedID 
     * @param {string} school 
     * @param {string} plainTextPassword 
     * @returns {Promise<PublicIdentityTokenObject>}
     */
    async register(name, email, schoolIssuedID, school, plainTextPassword) {

        try {
            const hashedPassword = String(await argon2.hash(plainTextPassword, {
                secret: process.env.ARGON_HASHING_SECRET
            }));

            const identityRecord = await IdentityRepo.createIdentity({
                name, email, schoolIssuedID, password: hashedPassword,
                school
            });

            const generatedToken = JsonWebTokenGenerator.generateJsonWebToken({
                _id: identityRecord._id,
                name,
                email,
                schoolIssuedID
            })

            IdentityRepo.addToGrantedTokenList(generatedToken, identityRecord._id)

            return {
                token: generatedToken
            }
        } catch (error) {
            throw error;
        }

    }

    /**
     * Log User In
     * @param {string} email 
     * @param {string} plainTextPassword 
     * @returns {Promise<PublicIdentityTokenObject>}
     */
    async login(email, plainTextPassword) {

        const identityRecord = await IdentityRepo.findIdentityByEmail(email);

        const isValidPassword = await argon2.verify(identityRecord.password, plainTextPassword, {
            secret: process.env.ARGON_HASHING_SECRET,
        });

        if (isValidPassword) {

            const generatedToken = JsonWebTokenGenerator.generateJsonWebToken({
                _id: identityRecord._id,
                name: identityRecord.name,
                email: identityRecord.email,
                schoolIssuedID: identityRecord.schoolIssuedID
            });

            await IdentityRepo.addToGrantedTokenList(generatedToken, identityRecord._id)

            return {
                token: generatedToken
            }
        }

        throw new Error('Not the correct password!')

    }

}

module.exports = Authentication;