export function onlyDigits(value: string) {
    return (value ?? '').replace(/\D/g, '');
}

export function isValidCPF(raw: string): boolean {
    const cpf = onlyDigits(raw);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    // cálculo dos dígitos
    const calc = (base: string, factor: number) =>
        ((base.split('').reduce((acc, n) => acc + Number(n) * factor--, 0) *
            10) %
            11) %
        10;

    const d1 = calc(cpf.slice(0, 9), 10);
    const d2 = calc(cpf.slice(0, 10), 11);
    return cpf.endsWith(`${d1}${d2}`);
}
