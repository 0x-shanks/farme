import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/utils/contract/generated.ts',
  plugins: [
    foundry({
      project: '../contracts',
      artifacts: 'out/',
      include: ['Canvas.sol/**']
    })
  ]
});
