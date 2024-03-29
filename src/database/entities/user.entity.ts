import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Attachment } from "@/database/entities/attachment.entity";

@Entity({ name: "User" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Unique(["email"])
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: "" })
  refreshToken: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @OneToMany(() => Attachment, (attachment) => attachment.user, {
    eager: false,
  })
  @JoinColumn({ name: "relationId" })
  attachments?: Attachment[];
}
