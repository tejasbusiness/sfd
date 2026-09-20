<?php
declare(strict_types=1);

// Front controller for /api/*. Deployed as dist/api/index.php (the build copies it),
// so it only assumes the project layout: <root>/api/src and <root>/.env, where
// <root> is two levels above this file in both the repo and on the server.
require dirname(__DIR__, 2) . '/api/src/bootstrap.php';

Sfd\App::run(dirname(__DIR__, 2));
