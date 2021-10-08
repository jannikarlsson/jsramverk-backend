const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        username: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) }
    })
})

module.exports = UserType;