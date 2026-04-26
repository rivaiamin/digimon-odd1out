import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const digimon = sqliteTable('digimon', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	image: text('image'),
	level: text('level'),
	attribute: text('attribute'),
	type: text('type'),
	field: text('field')
});
