<?php
// $Id: fuzzysearch-result.tpl.php,v 1.1 2010/03/06 23:02:59 awolfey Exp $

/**
 * @file
 * Template for fuzzysearch results.
 */

?>


<div id="node-<?php print $node->nid; ?>" class="node<?php if ($sticky) { print ' sticky'; } ?><?php if (!$status) { print ' node-unpublished'; } ?> clear-block">

<?php print $picture ?>

<?php if (!$page): ?>
  <h2><a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a></h2>
<?php endif; ?>
<div class="content">
  <?php print $content ?>
  <div>
    &#187; <a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a>
  </div>
</div>

  <?php print $links; ?>
</div>