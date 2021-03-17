function graphInputChanged(obj) {
    const invalidChars = /[^(\d|\s)]/;
    if(invalidChars.test(obj.value)) {
        obj.value = obj.value.replace(invalidChars, '');
    }
}