import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { SignUpDto } from '@/dtos/sign-up.dto';
import { UserRole } from '@/enums/user-role.enum';
import { AuthService } from '@/services/auth.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const users: SignUpDto[] = [
    {
      email: 'eric@portraitsforpatriots.org',
      password: 'PfpAdminPassword123$',
      firstName: 'Eric',
      lastName: 'S',
      role: UserRole.ADMIN,
      phoneNumber: '111-222-333',
      streetAddress1: '123 Main St',
      latitude: 0,
      longitude: 0,
    },
    {
      email: 'rmm.contractors@gmail.com',
      password: 'PfpAdminRonanPassword123$',
      firstName: 'Ronan',
      lastName: 'Murphy',
      role: UserRole.ADMIN,
      phoneNumber: '111-222-333',
      streetAddress1: '123 Main St',
      latitude: 0,
      longitude: 0,
    },
  ];

  for (const user of users) {
    try {
      await authService.signup(user);
      console.log(`Seeded user: ${user.email}`);
    } catch (error) {
      console.warn(
        `User ${user.email} already exists or failed to seed:`,
        error.message,
      );
    }
  }
  console.log('User seeding completed.');

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
