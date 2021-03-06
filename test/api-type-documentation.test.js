/* eslint-disable prefer-destructuring */
import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-type-documentation.js';

/** @typedef {import('..').ApiTypeDocumentationElement} ApiTypeDocumentationElement */

describe('ApiTypeDocumentationElement', () => {
  /**
   * @returns {Promise<ApiTypeDocumentationElement>}
   */
  async function basicFixture() {
    return (fixture(html`<api-type-documentation></api-type-documentation>`));
  }

  describe('Basic', () => {
    it('api-annotation-document is not in the DOM', async () => {
      const element = await basicFixture();
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-annotation-document');
      assert.notOk(node);
    });

    it('marked-element is not in the DOM', async () => {
      const element = await basicFixture();
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('marked-element');
      assert.notOk(node);
    });

    it('api-schema-document is not in the DOM', async () => {
      const element = await basicFixture();
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('api-schema-document');
      assert.notOk(node);
    });
  });

  describe('AMF data model tests', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach((item) => {
      describe('_computeTitle()', () => {
        let amf;
        let element;

        before(async () => {
          const data = await AmfLoader.load(0, item[1]);
          amf = data[0];
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
          await nextFrame();
        });

        it('Returns undefined when no shape', () => {
          const result = element._computeTitle();
          assert.isUndefined(result);
        });

        it('Returns title for schema.org/title', () => {
          const shape = {};
          const key = element._getAmfKey(element.ns.aml.vocabularies.core.name);
          shape[key] = {
            '@value': 'test-title'
          };
          const result = element._computeTitle(shape);
          assert.equal(result, 'test-title');
        });

        it('Returns title for shacl/name', () => {
          const shape = {};
          const key = element._getAmfKey(element.ns.w3.shacl.name);
          shape[key] = {
            '@value': 'test-title'
          };
          const result = element._computeTitle(shape);
          assert.equal(result, 'test-title');
        });

        it('Prefers schema.org/title over shacl/name', () => {
          const shape = {};
          const shaclKey = element._getAmfKey(element.ns.w3.shacl.name);
          shape[shaclKey] = {
            '@value': 'test-title-shacl'
          };
          const schemaKey = element._getAmfKey(element.ns.aml.vocabularies.core.name);
          shape[schemaKey] = {
            '@value': 'test-title-schema'
          };
          const result = element._computeTitle(shape);
          assert.equal(result, 'test-title-schema');
        });
      });

      describe('_computeIsSchema()', () => {
        let amf;
        let element;

        before(async () => {
          const data = await AmfLoader.load(0, item[1]);
          amf = data[0];
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
          await nextFrame();
        });

        it('Returns undefined when no shape', () => {
          const result = element._computeIsSchema();
          assert.isUndefined(result);
        });

        it('Returns false when not SchemaShape', () => {
          const result = element._computeIsSchema({
            '@type': ['not-schema']
          });
          assert.isFalse(result);
        });

        it('Returns true when SchemaShape', () => {
          const value = element._getAmfKey(element.ns.aml.vocabularies.shapes.SchemaShape);
          const result = element._computeIsSchema({
            '@type': [value]
          });
          assert.isTrue(result);
        });
      });

      describe(`Type object - ${item[0]}`, () => {
        let element;
        let amf;
        let type;

        before(async () => {
          const data = await AmfLoader.load(16, item[1]);
          amf = data[0];
          type = data[1];
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
          element.type = type;
          await aTimeout(0);
        });

        it('typeTitle is computed', () => {
          assert.equal(element.typeTitle, 'EnurableType');
        });

        it('hasCustomProperties is computed', () => {
          assert.isTrue(element.hasCustomProperties);
        });

        it('Renders api-annotation-document', () => {
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.ok(node);
        });

        it('description is computed', () => {
          assert.typeOf(element.description, 'string');
        });

        it('Renders arc-marked element', () => {
          const node = element.shadowRoot.querySelector('arc-marked');
          assert.ok(node);
        });

        it('isSchema is false', () => {
          assert.isFalse(element.isSchema);
        });

        it('api-schema-document is not in the DOM', () => {
          const node = element.shadowRoot.querySelector('api-schema-document');
          assert.notOk(node);
        });

        it('api-type-document renders with renderReadOnly set to true', async () => {
          assert.isTrue(element.shadowRoot.querySelector('api-type-document').renderReadOnly)
        });

        it('renders the type title', async () => {
          const node = element.shadowRoot.querySelector('.title');
          assert.dom.equal(node, `<div aria-level="2" class="title" part="type-title" role="heading">EnurableType</div>`);
        });
      });

      describe(`Schema object - ${  item[0]}`, () => {
        let element;
        let amf;
        let type;

        before(async () => {
          const data = await AmfLoader.load(11, item[1]);
          amf = data[0];
          type = data[1];
        });

        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amf;
          element.type = type;
          await nextFrame();
        });

        it('typeTitle is computed', () => {
          assert.equal(element.typeTitle, 'XmlSchema');
        });

        it('hasCustomProperties is computed', () => {
          assert.isTrue(element.hasCustomProperties);
        });

        it('Renders api-annotation-document', () => {
          const node = element.shadowRoot.querySelector('api-annotation-document');
          assert.ok(node);
        });

        it('isSchema is true', () => {
          assert.isTrue(element.isSchema);
        });

        it('Renders api-schema-document', () => {
          const node = element.shadowRoot.querySelector('api-schema-document');
          assert.ok(node);
        });

        it('passes mediaType to the renderer', async () => {
          element.mediaType = 'application/json';
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-schema-document');
          assert.equal(node.mediaType, 'application/json');
        });
      });
    });
  });
});
