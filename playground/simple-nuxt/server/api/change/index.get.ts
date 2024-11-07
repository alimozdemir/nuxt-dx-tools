export default defineEventHandler(async event => {
    const config = useRuntimeConfig();
    return 'Hello world get!';
});