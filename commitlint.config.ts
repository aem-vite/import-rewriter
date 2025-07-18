import { RuleConfigSeverity } from '@commitlint/types'

import type { UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    'body-max-line-length': [RuleConfigSeverity.Error, 'always', 200],
    'footer-max-line-length': [RuleConfigSeverity.Error, 'always', 300],
  },
}

export default Configuration
