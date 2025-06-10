import config from 'eslint-config-mourner';

export default [
    ...config,
    {
        files: ['*.js', 'test/*.js'],
        rules: {
            indent: ["error", 4],
        },
    }
];