import { Migration } from '@mikro-orm/migrations';

export class Migration20210531015853 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
