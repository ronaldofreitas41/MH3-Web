<?php

declare(strict_types=1);

require_once __DIR__ . '/core/bootstrap.php';
require_once __DIR__ . '/core/router.php';
?>
<?php require __DIR__ . '/html/layout/header.php'; ?>
<?php require __DIR__ . '/html/layout/login.php'; ?>
<?php require __DIR__ . '/html/layout/pwa.php'; ?>
<?php require __DIR__ . '/html/layout/sidebar-overlay.php'; ?>
<?php require __DIR__ . '/html/layout/sidebar.php'; ?>

<div class="main">
    <?php require __DIR__ . '/html/layout/topbar.php'; ?>
    <div class="content" id="app-content">
        <?php
        $pages = pageMap();
        foreach ($pages as $pageFile) {
            require __DIR__ . '/html/pages/' . $pageFile;
        }
        ?>
        <?php if (is_file(__DIR__ . '/html/shared/content-overlays.php')) require __DIR__ . '/html/shared/content-overlays.php'; ?>
    </div>

    <?php
    $modalFiles = glob(__DIR__ . '/html/modals/*.php');
    if (is_array($modalFiles)) {
        sort($modalFiles);
        foreach ($modalFiles as $modalFile) require $modalFile;
    }
    ?>
</div>

<?php require __DIR__ . '/html/layout/footer.php'; ?>