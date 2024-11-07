
export function useTest() {
    return false;
}

export const useText = () => {
    $fetch('/api/change')

    $fetch('/api/change', {
        method: 'POST'
    })

    return true;
};

