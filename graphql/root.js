const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const DocType = require("./documents.js");
const UserType = require("./users.js");

const docFunctions = require("../src/docFunctions.js");
const authFunctions = require("../src/authFunctions.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        documents: {
            type: GraphQLList(DocType),
            description: 'List of all documents',
            args: {
                username: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async function(parent, args) {
                return await docFunctions.findInCollection(args.username);
            }
        },
        users: {
            type: GraphQLList(UserType),
            description: 'List of all users',
            resolve: async function() {
                return await authFunctions.findInCollection();
            }
        },
        // singleDoc: {
        //     type: DocType,
        //     description: 'One document',
        //     args: {
        //         id: { type: GraphQLNonNull(GraphQLString) }
        //     },
        //     resolve: async function(parent, args) {
        //         return await docFunctions.getOne(args.id)
        //     }
        // },
        // singleUser: {
        //     type: UserType,
        //     description: 'One user',
        //     args: {
        //         username: { type: GraphQLNonNull(GraphQLString) }
        //     },
        //     resolve: async function(parent, args) {
        //         return await authFunctions.getOne(args.username)
        //     }
        // }
    })
});

module.exports = { RootQueryType };