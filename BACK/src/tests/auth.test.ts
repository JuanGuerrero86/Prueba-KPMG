// Integration tests — require DB. Run after migration:run and seed.
describe('Auth (integration)', () => {
  it.todo('Login exitoso → cookies access_token y refresh_token presentes');
  it.todo('Login con email incorrecto → 401 AUTH-001');
  it.todo('Refresh con token válido → nuevas cookies, token anterior revocado');
  it.todo('Refresh con token revocado → 401 AUTH-004');
  it.todo('Logout → token revocado, cookies limpiadas');
});
