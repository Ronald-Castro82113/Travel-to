import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ){}

    async register(data: {      
        email?: string;
        cedula?: string;
        password: string;
    }){

        //Validar que venga email o cedula
        if(!data.email && !data.cedula){
            throw new BadRequestException('Debe proporcionar email o cédula')
        }

        //Verificar si ya existe
        const conditions: any[] = [];

        if (data.email) {
            conditions.push({ email: data.email });
        }

        if (data.cedula) {
            conditions.push({ cedula: data.cedula });
        }

        const existingUser = await this.prisma.user.findFirst({ 
            where: {
                OR: conditions,
            },
         });

        if (existingUser) {
            throw new BadRequestException('El usuario ya existe');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                cedula: data.cedula,
                password: hashedPassword,
            },
        });

        return {
            message: 'Usuario creado correctamente',
            userId: user.id,
        };

    }

    async login(data: {email?: string; cedula?: string; password: string }) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    data.email ? { email: data.email } : undefined,
                    data.cedula ? { cedula: data.cedula } : undefined,
                ].filter(Boolean) as any,
            },
        });

        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        const passwordValid = await bcrypt.compare(data.password, user.password);

        if (!passwordValid) {
            throw new BadRequestException('Contraseña incorrecta');
        }

        const payload = {
            userId: user.id,
            role: user.role,
        };

        const token = this.jwtService.sign(payload);

        return {
            access_token : token,
        };
    }
}
