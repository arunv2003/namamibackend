import { sequelize } from '../src/core/config/db.js';

async function insertRole() {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL.');

    console.log('Inserting Admin Role record into roles table...');

    const permissionsObj = {
      name: 'Admin',
      status: 'active',
      permission: {
        task: { add: true, edit: true, delete: true, allView: true, ownView: true },
        admin: { add: true, edit: true, delete: true, allView: true, ownView: true },
        feeds: { add: true, edit: true, delete: true, allView: true, ownView: true }
      }
    };

    const [result] = await sequelize.query(`
      INSERT INTO roles (
        id,
        role_custom_id,
        name,
        slug,
        status,
        permission,
        createdBy,
        updatedBy,
        createdAt,
        updatedAt
      ) VALUES (
        1,
        'ROL001',
        'Admin',
        'admin',
        'active',
        :permission,
        1,
        1,
        '2026-07-20 15:30:39',
        '2026-07-22 08:24:31'
      )
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        permission = VALUES(permission),
        status = VALUES(status),
        updatedAt = VALUES(updatedAt);
    `, {
      replacements: {
        permission: JSON.stringify(permissionsObj)
      }
    });

    console.log('✅ Role inserted/updated successfully:', result);

    const [rows] = await sequelize.query("SELECT id, role_custom_id, name, slug, status, createdAt FROM roles WHERE id = 1;");
    console.log('Inserted Role Details:', rows);

  } catch (error) {
    console.error('❌ Role insert failed:', error);
  } finally {
    await sequelize.close();
  }
}

insertRole();
