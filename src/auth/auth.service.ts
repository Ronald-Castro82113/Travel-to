import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}

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
}
