const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
} = graphql;
import axios from 'axios';

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, _args) {
                return axios
                    .get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then((resp) => resp.data);
            },
        },
    }),
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, _args) {
                return axios
                    .get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then((resp) => resp.data);
            },
        },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: { type: GraphQLString },
            },
            resolve(_parentValue, args) {
                return axios
                    .get(`http://localhost:3000/users/${args.id}`)
                    .then((resp) => resp.data);
            },
        },
        company: {
            type: CompanyType,
            args: {
                id: { type: GraphQLString },
            },
            resolve(_parentValue, args) {
                return axios
                    .get(`http://localhost:3000/companies/${args.id}`)
                    .then((resp) => resp.data);
            },
        },
    },
});

const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString },
            },
            resolve(_parentValue, { firstName, age }) {
                return axios
                    .post('http://localhost:3000/users', { firstName, age })
                    .then((resp) => resp.data);
            },
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(_parentValue, { id }) {
                return axios
                    .delete('http://localhost:3000/users/' + id)
                    .then((resp) => resp.data);
            },
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(_parentValue, args) {
                return axios
                    .patch('http://localhost:3000/users/' + args.id, args)
                    .then((resp) => resp.data);
            },
        },
    },
});

export const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
});
