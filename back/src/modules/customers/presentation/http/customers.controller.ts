import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    ParseIntPipe,
    Post,
    Put,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';

import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.uc';
import { DepositUseCase } from '../../application/use-cases/deposit.uc';
import { GetCustomerUseCase } from '../../application/use-cases/get-customer.uc';
import { ListCustomersUseCase } from '../../application/use-cases/list-customers.uc';
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.uc';
import { WithdrawUseCase } from '../../application/use-cases/withdraw.uc';

import { Public } from '@app/decorators/public.decorator';
import { ParseMoneyToCentsPipe } from '@app/pipes/parse-money-to-cents.pipe';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { MoneyAmountDto } from '../../application/dto/money-amount.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';

@ApiTags('Clientes')
@ApiBearerAuth()
@ApiSecurity('ApiKeyAuth')
@Controller('clientes')
export class CustomersController {
    constructor(
        private readonly createCustomer: CreateCustomerUseCase,
        private readonly updateCustomer: UpdateCustomerUseCase,
        private readonly getCustomer: GetCustomerUseCase,
        private readonly listCustomers: ListCustomersUseCase,
        private readonly deposit: DepositUseCase,
        private readonly withdraw: WithdrawUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Listar clientes' })
    @ApiOkResponse({
        description: 'Lista de clientes retornada com sucesso.',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Ana Silva' },
                    email: { type: 'string', example: 'ana@example.com' },
                    document: { type: 'string', example: '66666666666' },
                    balanceCents: { type: 'integer', example: 125000 },
                    version: { type: 'integer', example: 3 },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    })
    list() {
        return this.listCustomers.execute();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter cliente por ID' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({
        description: 'Cliente encontrado.',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Ana Silva' },
                email: { type: 'string', example: 'ana@example.com' },
                balanceCents: { type: 'integer', example: 125000 },
                version: { type: 'integer', example: 3 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    get(@Param('id', ParseIntPipe) id: number) {
        return this.getCustomer.execute(id);
    }
    @Public()
    @Post()
    @ApiOperation({ summary: 'Criar novo cliente' })
    @ApiBody({ type: CreateCustomerDto })
    @ApiCreatedResponse({
        description: 'Cliente criado com sucesso.',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 2 },
                name: { type: 'string', example: 'João Souza' },
                email: { type: 'string', example: 'joao@example.com' },
                balanceCents: { type: 'integer', example: 0 },
                version: { type: 'integer', example: 0 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiBadRequestResponse({ description: 'Payload inválido' })
    create(@Body() dto: CreateCustomerDto) {
        return this.createCustomer.execute(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar cliente' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateCustomerDto })
    @ApiOkResponse({
        description: 'Cliente atualizado com sucesso.',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Ana Maria Silva' },
                email: { type: 'string', example: 'ana.maria@example.com' },
                balanceCents: { type: 'integer', example: 125000 },
                version: { type: 'integer', example: 4 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    @ApiBadRequestResponse({ description: 'Payload inválido' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCustomerDto,
    ) {
        return this.updateCustomer.execute(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover cliente (placeholder)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({
        description: 'Operação executada.',
        schema: {
            type: 'object',
            properties: { ok: { type: 'boolean', example: true } },
        },
    })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return { ok: true };
    }

    @Post(':id/depositar')
    @ApiOperation({ summary: 'Depositar valor no cliente' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiHeader({
        name: 'Idempotency-Key',
        description: 'Chave idempotente para evitar operações duplicadas',
        required: false,
        schema: {
            type: 'string',
            example: 'b3b9c1a1-4b2e-42d3-9c0a-2c6a2b6f0e21',
        },
    })
    @ApiBody({
        description: 'Valor a depositar (em número ou string monetária)',
        type: MoneyAmountDto,
        examples: {
            numeric: { value: { amount: 150.75 } },
            string: { value: { amountStr: '150.75' } },
        },
    })
    @ApiOkResponse({
        description: 'Saldo atualizado.',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                balanceCents: { type: 'integer', example: 275750 },
                version: { type: 'integer', example: 5 },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Amount must be positive / Concurrent modification',
    })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    depositar(
        @Param('id', ParseIntPipe) id: number,
        @Body(ParseMoneyToCentsPipe) body: { amountCents: number },
        @Headers('Idempotency-Key') idem?: string,
    ) {
        return this.deposit.execute({
            customerId: id,
            amount: body.amountCents,
            idempotencyKey: idem,
        });
    }

    @Post(':id/sacar')
    @ApiOperation({ summary: 'Sacar valor do cliente' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiHeader({
        name: 'Idempotency-Key',
        description: 'Chave idempotente para evitar operações duplicadas',
        required: false,
        schema: {
            type: 'string',
            example: 'b3b9c1a1-4b2e-42d3-9c0a-2c6a2b6f0e21',
        },
    })
    @ApiBody({
        description: 'Valor a sacar (em número ou string monetária)',
        type: MoneyAmountDto,
        examples: {
            numeric: { value: { amount: 100 } },
            string: { value: { amountStr: '100.00' } },
        },
    })
    @ApiOkResponse({
        description: 'Saldo atualizado.',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                balanceCents: { type: 'integer', example: 175750 },
                version: { type: 'integer', example: 6 },
            },
        },
    })
    @ApiBadRequestResponse({
        description:
            'Amount must be positive / Insufficient funds / Concurrent modification',
    })
    @ApiNotFoundResponse({ description: 'Customer not found' })
    sacar(
        @Param('id', ParseIntPipe) id: number,
        @Body(ParseMoneyToCentsPipe) body: { amountCents: number },
        @Headers('Idempotency-Key') idem?: string,
    ) {
        return this.withdraw.execute({
            customerId: id,
            amount: body.amountCents,
            idempotencyKey: idem,
        });
    }
}
