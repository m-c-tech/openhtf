/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Component representing the UserInput plug.
 */

import { trigger } from '@angular/animations';
import { Component, ElementRef } from '@angular/core';
import { Http } from '@angular/http';

import { ConfigService } from '../core/config.service';
import { FlashMessageService } from '../core/flash-message.service';
import { washIn } from '../shared/animations';

import { BasePlug } from './base-plug';

const PLUG_NAME = 'openhtf.plugs.user_input.UserInput';

const ALLOWED_PROMPT_TAGS = new Set([
  'div',
  'span',
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
]);

const ALLOWED_PROMPT_CLASSES = new Set([
  'prompt-pass',
  'prompt-fail',
  'prompt-large',
]);

const ALLOWED_PROMPT_STYLES = new Set([
  'font-size',
  'font-weight',
  'color',
  'text-align',
]);

/**
 * @param default: the default prompt string for element.
 * @param error: the error message for element.
 * @param id: the identifier for the element.
 * @param message: the message to display to the operator.
 * @param text-input: the text input provided by the operator.
 * @param image-url: url to embedded image in the element.
 */
export declare interface UserInputPlugState {
  default?: string;  // Used by ui_plugs.advanced_user_input.AdvancedUserInput.
  error?: string;    // Used by ui_plugs.advanced_user_input.AdvancedUserInput.
  id: string;
  message: string;
  'prompt-html'?: string;
  'text-input': string;
  'image-url': string;
  'is-user-question': string;
  'button-1-text': string;
  'button-2-text': string;
  'button-3-text': string;
}

/**
 * @param lastPromptId: identifier of last prompt.
 * @param lastPromptHtml: html contents of last prompt.
 */
@Component({
  animations: [trigger('animateIn', washIn)],
  selector: 'htf-user-input-plug',
  templateUrl: './user-input-plug.component.html',
  styleUrls: ['./user-input-plug.component.scss'],
})
export class UserInputPlugComponent extends BasePlug {
  private lastPromptId: string;
  private lastPromptHtml: string;

  constructor(
      config: ConfigService, http: Http, flashMessage: FlashMessageService,
      private ref: ElementRef) {
    super(PLUG_NAME, config, http, flashMessage);
  }

  get error() {
    return this.getPlugState().error;
  }

  get prompt() {
    const state = this.getPlugState();
    // Run this when a new prompt is set.
    if (this.lastPromptId !== state.id) {
      this.lastPromptId = state.id;
      if (state['prompt-html']) {
        this.lastPromptHtml = this.sanitizePromptHtml(state['prompt-html']);
      } else {
        this.lastPromptHtml = this.convertPlainTextToHtml(state.message);
      }
      this.focusSelf();
      if (state.default) {
        this.setResponse(state.default);
      }
    }
    return this.lastPromptHtml;
  }

  hasTextInput() {
    return this.getPlugState()['text-input'];
  }

  hasImage() {
    return this.getPlugState()['image-url'];
  }

  get Image_URL() {
    return this.getPlugState()['image-url'];
  }

  is_user_question() {
    return ((this.getPlugState()['button-1-text'] !== null) &&
            (this.getPlugState()['button-1-text'].length !== 0)) ||
        ((this.getPlugState()['button-2-text'] !== null) &&
         (this.getPlugState()['button-2-text'].length !== 0)) ||
        ((this.getPlugState()['button-3-text'] !== null) &&
         (this.getPlugState()['button-3-text'].length !== 0));
  }


 Button_1() {
    return this.getPlugState()['button-1-text'];
 }

  Button_2() {
    return this.getPlugState()['button-2-text'];
  }

  Button_3() {
    return this.getPlugState()['button-3-text'];
  }


  sendAnswer(input: string) {
    const promptId = this.getPlugState().id;
    let response: string;
    if (this.is_user_question()) {
      response = input.trim();
    } else {
      response = '';
    }
    this.respond('respond', [promptId, response]);
  }

  sendResponse(input: HTMLInputElement) {
    const promptId = this.getPlugState().id;
    let response: string;
    if (this.hasTextInput()) {
      response = input.value;
      input.value = '';
    } else {
      response = '';
    }
    this.respond('respond', [promptId, response]);
  }

  protected getPlugState() {
    return super.getPlugState() as UserInputPlugState;
  }

  private focusSelf() {
    const input = this.ref.nativeElement.querySelector('input');
    if (input) {
      input.focus();
    }
  }

  private setResponse(response) {
    const input = this.ref.nativeElement.querySelector('input');
    if (input) {
      input.value = response;
    }
  }

  private convertPlainTextToHtml(message: string) {
    const escaped = this.escapeHtml(message);
    return escaped.replace(/\n/g, '<br>');
  }

  private escapeHtml(message: string) {
    return message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
  }

  private sanitizePromptHtml(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    this.sanitizeNode(doc.body, doc);
    return doc.body.innerHTML;
  }

  private sanitizeNode(node: Node, doc: Document) {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const element = child as Element;
      const tagName = element.tagName.toLowerCase();
      if (!ALLOWED_PROMPT_TAGS.has(tagName)) {
        const textNode = doc.createTextNode(element.textContent || '');
        if (element.parentNode) {
          element.parentNode.replaceChild(textNode, element);
        }
        continue;
      }

      this.sanitizeAttributes(element);
      this.sanitizeNode(element, doc);
    }
  }

  private sanitizeAttributes(element: Element) {
    for (const attr of Array.from(element.attributes)) {
      if (attr.name !== 'class' && attr.name !== 'style') {
        element.removeAttribute(attr.name);
      }
    }

    if (element.hasAttribute('class')) {
      const safeClasses = element.className
          .split(/\s+/)
          .filter((className) => ALLOWED_PROMPT_CLASSES.has(className));
      if (safeClasses.length) {
        element.className = safeClasses.join(' ');
      } else {
        element.removeAttribute('class');
      }
    }

    if (element.hasAttribute('style')) {
      const safeStyles = this.filterInlineStyles(
          element.getAttribute('style'));
      if (safeStyles.length) {
        element.setAttribute('style', safeStyles);
      } else {
        element.removeAttribute('style');
      }
    }
  }

  private filterInlineStyles(styleText: string | null) {
    if (!styleText) {
      return '';
    }
    const safePairs: string[] = [];
    for (const chunk of styleText.split(';')) {
      const trimmedChunk = chunk.trim();
      if (!trimmedChunk) {
        continue;
      }
      const parts = trimmedChunk.split(':');
      if (parts.length < 2) {
        continue;
      }
      const property = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(':').trim();
      if (!ALLOWED_PROMPT_STYLES.has(property)) {
        continue;
      }
      if (!this.isSafeStyleValue(value)) {
        continue;
      }
      safePairs.push(`${property}: ${value}`);
    }
    return safePairs.join('; ');
  }

  private isSafeStyleValue(value: string) {
    const lowered = value.toLowerCase();
    return !lowered.includes('url(') &&
        !lowered.includes('expression(') &&
        !lowered.includes('javascript:');
  }
}
