import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(
        @Body() body: {
            email?: string,
            cedula?: string,
            password: string,
        },
    ){
        return this.authService.register(body);
    }

    @Post('login')
    async login(
        @Body() body: {
            email?: string;
            cedula?: string;
            password: string;
        },
    )   {
        return this.authService.login(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtected() {
        return { message: 'Ruta protegida funcionando' };
    }
}
