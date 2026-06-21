import { db } from './src/lib/db';

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await db.upgradeRequest.deleteMany();
  await db.transaction.deleteMany();
  await db.withdrawAccount.deleteMany();
  await db.event.deleteMany();
  await db.promo.deleteMany();
  await db.movie.deleteMany();
  await db.user.deleteMany();

  // Create admin user
  const admin = await db.user.create({
    data: {
      username: 'laliwagroup88',
      password: 'laliwa88',
      email: 'admin@milesapp.com',
      phone: '081200001122',
      role: 'admin',
      withdrawPassword: '123456',
      status: 'active',
      balance: 0,
    },
  });
  console.log('Created admin user:', admin.username);

  // Create sample users with various lastActive times
  const now = new Date();
  const usersData = [
    { username: 'Ahmad_Rizky', password: 'user1234', email: 'ahmad@gmail.com', phone: '081234567890', balance: 1500000, lastActive: new Date(now.getTime() - 2 * 60 * 1000) },
    { username: 'Siti_Nurhaliza', password: 'user1234', email: 'siti.nur@gmail.com', phone: '081298765432', balance: 750000, lastActive: new Date(now.getTime() - 15 * 60 * 1000) },
    { username: 'Budi_Santoso', password: 'user1234', email: 'budi.s@gmail.com', phone: '081355566677', balance: 2300000, lastActive: new Date(now.getTime() - 45 * 60 * 1000) },
    { username: 'Dewi_Lestari', password: 'user1234', email: 'dewi.l@gmail.com', phone: '081477788899', balance: 500000, lastActive: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { username: 'Rina_Wati', password: 'user1234', email: 'rina.w@gmail.com', phone: '081511122233', balance: 3200000, lastActive: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
    { username: 'Fajar_Prabowo', password: 'user1234', email: 'fajar.p@gmail.com', phone: '081633344455', balance: 890000, lastActive: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { username: 'Maya_Anggraini', password: 'user1234', email: 'maya.a@gmail.com', phone: '081755566677', balance: 1750000, lastActive: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
    { username: 'Reza_Ardiansyah', password: 'user1234', email: 'reza.a@gmail.com', phone: '081888899900', balance: 420000, lastActive: new Date(now.getTime() - 72 * 60 * 60 * 1000) },
    { username: 'Putri_Maharani', password: 'user1234', email: 'putri.m@gmail.com', phone: '081911122233', balance: 5600000, lastActive: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    { username: 'Galih_Saputra', password: 'user1234', email: 'galih.s@gmail.com', phone: '082033344455', balance: 1100000, lastActive: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { username: 'Nabila_Aulia', password: 'user1234', email: 'nabila.a@gmail.com', phone: '082155566677', balance: 670000, lastActive: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
    { username: 'Hana_Putriani', password: 'user1234', email: 'hana.p@gmail.com', phone: '082288899900', balance: 2100000, lastActive: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    { username: 'Kevin_Prakoso', password: 'user1234', email: 'kevin.p@gmail.com', phone: '082311122233', balance: 950000, lastActive: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) },
    { username: 'Intan_Kusuma', password: 'user1234', email: 'intan.k@gmail.com', phone: '082433344455', balance: 3800000, lastActive: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
    { username: 'Taufik_Nugroho', password: 'user1234', email: 'taufik.n@gmail.com', phone: '082555566677', balance: 280000, lastActive: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await db.user.create({
      data: {
        username: u.username,
        password: u.password,
        email: u.email,
        phone: u.phone,
        balance: u.balance,
        withdrawPassword: '123456',
        role: 'user',
        status: 'active',
        inviteCode: '',
        lastActive: u.lastActive,
      },
    });
    createdUsers.push(user);
    console.log('Created user:', user.username);
  }

  // Create withdraw accounts for most users
  const withdrawData = [
    { userId: createdUsers[0].id, cardType: 'BCA', bankOwner: 'Ahmad Rizky Pratama', phone: '081234567890', bankName: 'BCA', accountNumber: '1234567890' },
    { userId: createdUsers[1].id, cardType: 'Mandiri', bankOwner: 'Siti Nurhaliza', phone: '081298765432', bankName: 'Mandiri', accountNumber: '0987654321' },
    { userId: createdUsers[2].id, cardType: 'BNI', bankOwner: 'Budi Santoso', phone: '081355566677', bankName: 'BNI', accountNumber: '1122334455' },
    { userId: createdUsers[3].id, cardType: 'BRI', bankOwner: 'Dewi Lestari', phone: '081477788899', bankName: 'BRI', accountNumber: '5566778899' },
    { userId: createdUsers[4].id, cardType: 'SeaBank', bankOwner: 'Rina Wati', phone: '081511122233', bankName: 'SeaBank', accountNumber: '9988776655' },
    { userId: createdUsers[5].id, cardType: 'DANA', bankOwner: 'Fajar Prabowo', phone: '081633344455', bankName: 'DANA', accountNumber: '081633344455' },
    { userId: createdUsers[6].id, cardType: 'GOPAY', bankOwner: 'Maya Anggraini', phone: '081755566677', bankName: 'GOPAY', accountNumber: '081755566677' },
    { userId: createdUsers[7].id, cardType: 'OVO', bankOwner: 'Reza Ardiansyah', phone: '081888899900', bankName: 'OVO', accountNumber: '081888899900' },
    { userId: createdUsers[8].id, cardType: 'BSI', bankOwner: 'Putri Maharani', phone: '081911122233', bankName: 'BSI', accountNumber: '3344556677' },
    { userId: createdUsers[9].id, cardType: 'CIMB Niaga', bankOwner: 'Galih Saputra', phone: '082033344455', bankName: 'CIMB Niaga', accountNumber: '7788990011' },
    { userId: createdUsers[10].id, cardType: 'BTPN Syariah', bankOwner: 'Nabila Aulia', phone: '082155566677', bankName: 'BTPN Syariah', accountNumber: '2233445566' },
    { userId: createdUsers[11].id, cardType: 'Bank Jago', bankOwner: 'Hana Putriani', phone: '082288899900', bankName: 'Bank Jago', accountNumber: '6655443322' },
  ];

  for (const wa of withdrawData) {
    await db.withdrawAccount.create({ data: wa });
    console.log('Created withdraw account for user:', wa.accountNumber);
  }

  // Create 4 movies (popular type)
  const movies = await Promise.all([
    db.movie.create({ data: { title: 'The Hostage Hero', genre: 'Aksi', img: 'hostagefilm', type: 'popular', rating: '9.2' } }),
    db.movie.create({ data: { title: 'Tunggu Aku Sukses Nanti', genre: 'Drama', img: 'tungguaku', type: 'popular', rating: '9.5' } }),
    db.movie.create({ data: { title: 'Danur The Last Chapter', genre: 'Horor', img: 'danurlast', type: 'popular', rating: '8.9' } }),
    db.movie.create({ data: { title: 'Mortal Kombat II', genre: 'Aksi', img: 'mortalfilm', type: 'popular', rating: '9.0' } }),
  ]);
  console.log(`Created ${movies.length} movies`);

  // Create 12 promos
  const promos = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      db.promo.create({ data: { img: `promofilm${i + 1}`, link: '#' } })
    )
  );
  console.log(`Created ${promos.length} promos`);

  // Create 6 events
  const events = await Promise.all([
    db.event.create({ data: { title: "THE HOSTAGE'S HERO", aktivasi: 'AKTIVASI PERTAMA', img: 'hostageevent' } }),
    db.event.create({ data: { title: 'TUNGGU - AKU SUKSES NANTI', aktivasi: 'AKTIVASI KEDUA', img: 'tungguevent' } }),
    db.event.create({ data: { title: 'Semua Halal?', aktivasi: 'AKTIVASI KETIGA', img: 'halalevent' } }),
    db.event.create({ data: { title: 'Bukit Budi', aktivasi: 'AKTIVASI KEEMPAT', img: 'bukitevent' } }),
    db.event.create({ data: { title: 'Pantastik Akulah berhijab', aktivasi: 'AKTIVASI KELIMA', img: 'pantastikevent' } }),
    db.event.create({ data: { title: 'Jangan Dipaksa', aktivasi: 'AKTIVASI KEENAM', img: 'dipaksaevent' } }),
  ]);
  console.log(`Created ${events.length} events`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
