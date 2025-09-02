export class Customer {
    constructor(
        public readonly id: number,
        public name: string,
        public document: string,
        public email: string,
        public balanceCents: number,
        public version: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}
}
