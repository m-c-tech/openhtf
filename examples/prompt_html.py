# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Example using prompt_html for a large pass/fail operator prompt."""

import openhtf
from openhtf import plugs
from openhtf.plugs import user_input


@plugs.plug(prompts=user_input.UserInput)
def operator_prompt_example(test: openhtf.TestApi, prompts: user_input.UserInput) -> None:
  response = prompts.prompt(
      message='Verify the DUT status in the fixture.',
      prompt_html=(
          '<div class="prompt-large prompt-pass" style="text-align:center;">'
          'PASS'
          '</div>'
          '<div>Click Continue to proceed.</div>'
      ),
      button_1_text='Continue',
      button_2_text='Abort')
  test.logger.info('Operator selected: %s', response)


if __name__ == '__main__':
  openhtf.Test(operator_prompt_example).execute()
