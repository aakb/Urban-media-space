<?php
// $Id: views-slideshow-thumbnailhover.tpl.php,v 1.1.2.1.2.10 2010/04/18 04:45:05 redndahead Exp $

/**
 * @file
 * Views Slideshow: Thumbnail Hover template file.
 */
?>

<?php if ($controls_top || $image_count_top || $breakout_top): ?>
  <div class="views-slideshow-controls-top clear-block">
    <?php print $controls_top; ?>
    <?php print $pager_top; ?>
    <?php print $breakout_top; ?>
  </div>
<?php endif; ?>

<?php print $slideshow; ?>

<?php if ($breakout_bottom || $controls_bottom || $image_count_bottom): ?>
  <div class="views-slideshow-controls-bottom clear-block">
    <?php print $breakout_bottom; ?>
    <?php print $controls_bottom; ?>
    <?php print $image_count_bottom; ?>
  </div>
<?php endif; ?>
