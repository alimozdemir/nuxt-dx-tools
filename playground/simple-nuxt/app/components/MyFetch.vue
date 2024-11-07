<script lang="ts" setup>
$fetch('/api/myapi');

$fetch('/api/mytest');

useFetch('/api/myapi')

$fetch('/api/change', {
    method: 'POST',
    body: JSON.stringify({ name: 'test' }),
})

$fetch('/api/change', {
    method: 'GET',
    body: JSON.stringify({ name: 'test' }),
})

$fetch('/api/change')

const id = 1;

$fetch(`/api/blog/` + id)

$fetch('/api/blog/' + id)

$fetch("/api/blog/" + id)

$fetch(`/api/blog/${id}`)

$fetch(`/api/blog/${id}/my-slug`)

$fetch("/api/blog/" + id + '/new')

$fetch("/api/blog/" + id + '/' + id)

useFetch('/api/blog/' + id + '/my-blog-slug/and-more')

const myFetch = $fetchSetup();

myFetch('/api/myapi');
</script>

<template>

</template>