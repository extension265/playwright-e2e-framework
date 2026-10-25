import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

/** Register schemas up front so they can `$ref` each other by `$id`. */
export function registerSchemas(...schemas) {
  for (const schema of schemas) {
    if (!ajv.getSchema(schema.$id)) ajv.addSchema(schema);
  }
}

/** Throws a readable error when `data` does not match a registered `schema`. */
export function assertSchema(schema, data, label = schema.title) {
  const validate = ajv.getSchema(schema.$id);
  if (!validate) throw new Error(`Schema "${schema.$id}" is not registered.`);
  if (!validate(data)) {
    const details = validate.errors.map((e) => `  ${e.instancePath || '(root)'} ${e.message}`).join('\n');
    throw new Error(`${label} failed schema validation:\n${details}\nBody: ${JSON.stringify(data)}`);
  }
}
