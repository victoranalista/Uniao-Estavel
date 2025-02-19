import { Declaration } from '../entities/Declaration';
export interface GenerateDeclarationUseCase {
  execute(declaration: Declaration, seal: string): Promise<Uint8Array>;
}
