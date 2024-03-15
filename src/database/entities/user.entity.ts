import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Blob } from "@/database/entities/blob.entity";

@Entity({ name: "users" })
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

  @OneToMany(() => Blob, (blob) => blob.user)
  public blobs?: Blob[];
}
