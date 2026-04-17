import { User } from "@/models";

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
      userId?: string;
    }
  }
}

export {};