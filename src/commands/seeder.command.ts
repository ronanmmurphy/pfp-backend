import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { UserRole, UserStatus } from '@/enums/user.enum';
import { CreateUserDto } from '@/dtos/user.dto';
import { UserService } from '@/services/user.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const users: CreateUserDto[] = [
    {
      email: 'eric@portraitsforpatriots.org',
      password: 'PfpAdminPassword123$',
      firstName: 'Eric',
      lastName: 'S',
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
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
      status: UserStatus.APPROVED,
      phoneNumber: '111-222-333',
      streetAddress1: '123 Main St',
      latitude: 0,
      longitude: 0,
    },
  ];

  console.log('User seeding started...');
  for (const user of users) {
    try {
      await userService.createUser(user);
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
