// TODO: for SSR fetch https://nuxt.com/docs/getting-started/data-fetching#pass-cookies-from-server-side-api-calls-on-ssr-response
export function $fetchSetup() {
    const headers = useRequestHeaders(['cookie']);
    
    return $fetch.create({
        credentials: 'include',
        headers
    });
}
