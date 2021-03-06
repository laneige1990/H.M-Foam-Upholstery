<?php
// THESE ARE GEORGE'S CUSTOM functions NEEDED FOR FoamCalculatorScript.js
// 
// George's function to return the job infomation
function JobDetails() {
    global $wpdb;

    $jobid = intval($_POST['jobid']);

    $Job_table_name = $wpdb->prefix . "FoamJob";
    $Job_Foam_table_name = $wpdb->prefix . "FoamDataJob";
    $Foam_table_name = $wpdb->prefix . "ItemData";

    $jobdetails = $wpdb->get_results("SELECT jobname, jobdescription, url FROM  $Job_table_name WHERE jobid=$jobid", OBJECT);

    $foamdetails = $wpdb->get_results("
                        SELECT $Foam_table_name.id, $Foam_table_name.name
                         FROM $Job_table_name
                        JOIN $Job_Foam_table_name
                         ON $Job_Foam_table_name.job_id = $Job_table_name.jobid
                        JOIN $Foam_table_name
                         ON $Foam_table_name.id = $Job_Foam_table_name.foam_id
                        WHERE $Job_table_name.jobid = $jobid 
                            ", OBJECT);

    foreach ($jobdetails as $chunks) {
        
    }

    array_unshift($foamdetails, $chunks);

    echo json_encode($foamdetails);

    wp_die();
}

add_action('MY_AJAX_HANDLER_type_call', 'JobDetails');
add_action('MY_AJAX_HANDLER_nopriv_type_call', 'JobDetails');

// George's function to grab foam details
function grab_foam_details() {
    global $wpdb;

    $selectionid = intval($_POST['foamid']);

    $table_name = $wpdb->prefix . "ItemData";
    // Grab the foam text, price and url to send back.
    $sql = $wpdb->get_results("SELECT name,pricepsi,description,sheetsize,colour,url,maxmin FROM $table_name WHERE id=$selectionid");

    foreach ($sql as $chunks) {
        echo $chunks->name . '||';
        echo number_format($chunks->pricepsi, 2) . '||';
        echo $chunks->description . '||';
        echo $chunks->colour . '||';
        echo $chunks->url . '||';
        echo $chunks->sheetsize . '||';
        echo $chunks->maxmin . '||';
    }

    wp_die();
}

//add_action('wp_ajax_foam_call', 'grab_foam_details');
add_action('MY_AJAX_HANDLER_foam_call', 'grab_foam_details');
add_action('MY_AJAX_HANDLER_nopriv_foam_call', 'grab_foam_details');

// function to grab the extras details
function grab_extras_details() {
    global $wpdb;

    $wrapid = intval($_POST['wrapid']);
    $topperid = intval($_POST['topperid']);
    $holesid = intval($_POST['holesid']);
    $stockinette_id = $_POST['Stockinetteid'];

    $Item_table = $wpdb->prefix . "ItemData";

    // Grab the foam text, price and url to send back.
    $sql = $wpdb->get_results("SELECT name,description,url FROM $Item_table WHERE id=$wrapid");
    $sql2 = $wpdb->get_results("SELECT name,description,url FROM $Item_table WHERE id=$topperid");
    $sql3 = $wpdb->get_results("SELECT name,description,url FROM $Item_table WHERE id=$holesid");
    $sql4 = $wpdb->get_results("SELECT name,description,url FROM $Item_table WHERE id=$stockinette_id");
    foreach ($sql as $chunks) {
        echo $chunks->name . '||';
        echo $chunks->description . '||';
        echo $chunks->url . '||';
    }
    foreach ($sql2 as $chunks) {
        echo $chunks->name . '||';
        echo $chunks->description . '||';
        echo $chunks->url . '||';
    }
    foreach ($sql3 as $chunks) {
        echo $chunks->name . '||';
        echo $chunks->description . '||';
        echo $chunks->url . '||';
    }
    foreach ($sql4 as $chunks) {
        echo $chunks->name . '||';
        echo $chunks->description . '||';
        echo $chunks->url . '||';
    }

    wp_die();
}

//add_action('wp_ajax_extras_call', 'grab_extras_details');
add_action('MY_AJAX_HANDLER_extras_call', 'grab_extras_details');
add_action('MY_AJAX_HANDLER_nopriv_extras_call', 'grab_extras_details');

// function to grab the extras prices
function grab_extra_price() {
    global $wpdb;
    $columnstring;
    $foamid = 0;
    $ExtraDetails = array();
    $polywrap = 0;
    $topper = 0;
    $holes = 0;

    $wrapid = intval($_POST['wrapPriceid']);
    $columnid = intval($_POST['wrapColumnid']);
    $topperid = intval($_POST['topperid']);
    $holesid = intval($_POST['holesid']);

    $PolyesterTable = $wpdb->prefix . "PolyesterPrices";
    $ItemTable = $wpdb->prefix . "ItemData";


    if ($wrapid > 0) {
        if ($columnid == 17) {
            $columnstring = "topbottomwrap";
        } else if ($columnid == 18) {
            $columnstring = "4ozpolyesterwrap";
        } else if ($columnid == 19) {
            $columnstring = "9ozpolyesterwrap";
        } else if ($columnid == 20) {
            $columnstring = "domedwrap";
        } else if ($columnid == 27) {
            $columnstring = "stockinette";
        }

        $sqlWrap = $wpdb->get_results("SELECT $columnstring FROM $PolyesterTable WHERE id=$wrapid");

        foreach ($sqlWrap as $chunks1) {
            $polywrap = $chunks1->$columnstring;
        }
    }

    if ($topperid > 0) {
        if ($topperid == 21 || $topperid == 23) {
            $foamid = 4;
        } else if ($topperid == 22 || $topperid == 24) {
            $foamid = 13;
        }

        $sqlTopper = $wpdb->get_results("SELECT pricepsi FROM $ItemTable WHERE id=$foamid");

        foreach ($sqlTopper as $chunks2) {
            $topper = $chunks2->pricepsi;
        }
    }

    if ($holesid > 0) {
        $sqlHoles = $wpdb->get_results("SELECT pricepsi FROM $ItemTable WHERE id=$holesid");

        foreach ($sqlHoles as $chunks3) {
            $holes = $chunks3->pricepsi;
            
        }
    }
 
    array_unshift($ExtraDetails, $polywrap, $topper, $holes);

    echo json_encode($ExtraDetails);

    wp_die();
}

//add_action('wp_ajax_wrap_price_call', 'grab_wrap_price');
add_action('MY_AJAX_HANDLER_extra_price_call', 'grab_extra_price');
add_action('MY_AJAX_HANDLER_nopriv_extra_price_call', 'grab_extra_price');

// function to grab the drilled hole details
function grab_holes_details() {
    global $wpdb;

    $table_name = $wpdb->prefix . "ItemData";
    // Grab the foam text, price and url to send back.
    $sql = $wpdb->get_results("SELECT name,url FROM $table_name WHERE id=$holesid");

    foreach ($sql as $chunks) {
        echo $chunks->name . '||';
        echo $chunks->url . '||';
    }

    wp_die();
}

add_action('MY_AJAX_HANDLER_holes_call', 'grab_holes_details');
add_action('MY_AJAX_HANDLER_nopriv_holes_call', 'grab_holes_details');

// function to grab the shape details
function grab_shape_details() {
    global $wpdb;

    $shape_id = $_POST['shapeid'];


    $Shape_table_name = $wpdb->prefix . "ShapeData";
    $Shape_coords_table_name = $wpdb->prefix . "ShapeCoords";


    $sql = $wpdb->get_results("SELECT name,url,imgid FROM $Shape_table_name WHERE id = $shape_id");

    $sql2 = $wpdb->get_results("
                            SELECT $Shape_coords_table_name.coords
                             FROM $Shape_table_name
                            JOIN $Shape_coords_table_name
                             ON $Shape_table_name.id = $Shape_coords_table_name.shapeid
                            WHERE $Shape_table_name.id = $shape_id
                                 ");

    foreach ($sql as $chunks) {
        echo $chunks->name . '||';
        echo $chunks->url . '||';
        echo $chunks->imgid . '||';
    }

    echo do_shortcode("[tooltip text='The thickness of foam is cut at the half inch with the exception of quarter inch on certain foams. The seemingly random measurements in CM are the equivalent of the inch size.']<img src='http://www.hmfoam.co.uk.gridhosted.co.uk/wp-content/uploads/2015/03/tooltip.png' alt='tooltip' width='22' height='21' class='aligncenter size-full wp-image-2417' />[/tooltip]") . '||';

    foreach ($sql2 as $chunks) {
        echo $chunks->coords . '`';
    }

    wp_die();
}

add_action('MY_AJAX_HANDLER_shape_call', 'grab_shape_details');
add_action('MY_AJAX_HANDLER_nopriv_shape_call', 'grab_shape_details');

function createnewfoamproduct() { // This creates a new foam product within the wordpress API for sale processing
    // import data from the jquery

    global $woocommerce;
    $dimensions = $_POST['dimensions'];
    $measurmentunit = $_POST['unit'];
    $shapeid = $_POST['shapeimgid'];

    $new_post = array(
        'post_title' => 'Foam: ' . $_POST['foamtype'] . ' Size: ' . $dimensions[0] . $measurmentunit . ' x ' . $dimensions[1]
        . $measurmentunit . ' x ' . $dimensions[2] . $measurmentunit,
        'post_status' => 'private',
        'post_type' => 'product'
    );

    $post_id = wp_insert_post($new_post);

    update_post_meta($post_id, '_foamtype', $_POST['foamtype']);
    update_post_meta($post_id, '_price', $_POST['foamprice']);
    update_post_meta($post_id, '_visibility', 'private');
    update_post_meta($post_id, '_stock_status', 'instock');
    update_post_meta($post_id, '_regular_price', $_POST['foamprice']);
    update_post_meta($post_id, '_featured', 'no');
    update_post_meta($post_id, '_length', $dimensions[0]);
    update_post_meta($post_id, '_width', $dimensions[1]);
    update_post_meta($post_id, '_height', $dimensions[2]);
    for ($i = 0; $i < count($dimensions); $i++) {
        add_post_meta($post_id, '_extraDimensions', $dimensions[$i]);
    }
    update_post_meta($post_id, '_polywrap', $_POST['polywrapid']);
    update_post_meta($post_id, '_topper', $_POST['topperid']);
    update_post_meta($post_id, '_holes', $_POST['holesid']);
    update_post_meta($post_id, '_stockinette', $_POST['stockinetteid']);
    update_post_meta($post_id, '_thumbnail_id', $shapeid);
    update_post_meta($post_id, '_backorders', 'no');
    update_post_meta($post_id, '_shapeid', $shapeid);
    update_post_meta($post_id, '_unit', $_POST['unit']);
    update_post_meta($post_id, '_foam', $_POST['foam']);


    $woocommerce->cart->add_to_cart($post_id, $_POST['quantity']);

    echo $post_id;

    wp_die();
}

add_action('MY_AJAX_HANDLER_create_product', 'createnewfoamproduct');
add_action('MY_AJAX_HANDLER_nopriv_create_product', 'createnewfoamproduct');

//This function will grab the relivent extra order infomation
function GrabExtraOrderInfo($args) {
    global $wpdb;
    $letterarray = array("A", "B", "C", "D", "E", "F", "G", "H", "I", "J");
    $order = new WC_Order($args->id); //Grab order object from email
    $items = $order->get_items(); //Grab all the items

    foreach ($items as $item) { //This ensures that each item is processed seperatly 
        $product_id = $item['product_id'];

        $Foam = get_post_meta($product_id, '_foam', true);


        if ($Foam == true) { // Check to see if item is foam or not.
            $ExtraDimensions = get_post_meta($product_id, '_extraDimensions');
            $Shapeid = get_post_meta($product_id, '_shapeid', true); //Grab shape ID
            $FoamType = get_post_meta($product_id, '_foamtype', true);

            $ShapeTable = $wpdb->prefix . "ShapeData"; //Set tables ready for sql
            $ItemTable = $wpdb->prefix . "ItemData";

            $polywrap = get_post_meta($product_id, '_polywrap', true); // Grab all the extra details
            $topper = get_post_meta($product_id, '_topper', true);
            $holes = get_post_meta($product_id, '_holes', true);
            $stockinette = get_post_meta($product_id, '_stockinette', true);
            $unit = get_post_meta($product_id, '_unit', true);

            $url = $wpdb->get_results("SELECT $ShapeTable.url2 FROM $ShapeTable WHERE id = $Shapeid ");

            // DRAW EMAIL
            echo "<div class='EmailContainer' style='float: left;'>";
            echo "<b>Foam order details</b><br>";
            echo $FoamType;

            if ($polywrap > 0) {
                $polygrab = $wpdb->get_results("SELECT $ItemTable.name FROM $ItemTable WHERE id = $polywrap ");
                foreach ($polygrab as $chunks) {
                    echo "<div class='EmailElement'><b>Polywrap:</b> " . $chunks->name . "<br></div>";
                }
            }
            if ($topper > 0) {
                $toppergrab = $wpdb->get_results("SELECT $ItemTable.name FROM $ItemTable WHERE id = $topper ");
                foreach ($toppergrab as $chunks2) {
                    echo "<div class='EmailElement'><b>Topper:</b> " . $chunks2->name . "<br></div>";
                }
            }

            if ($holes > 0) {
                $holesgrab = $wpdb->get_results("SELECT $ItemTable.name FROM $ItemTable WHERE id = $holes ");
                foreach ($holesgrab as $chunks3) {
                    echo "<div class='EmailElement'><b>Holes:</b> " . $chunks3->name . "<br></div>";
                }
            }

            if ($stockinette > 0) {
                $stockinettegrab = $wpdb->get_results("SELECT $ItemTable.name FROM $ItemTable WHERE id = $stockinette ");
                foreach ($stockinettegrab as $chunks4) {
                    echo "<div class='EmailElement'><b>Stockinette:</b> " . $chunks4->name . "<br></div>";
                }
            }

            echo "<div class='EmailElement'>";
            echo '<b>Shape Dimensions:</b>' . "<br>";

            foreach ($ExtraDimensions as $key => $values) {
                echo "<b>" . $letterarray[$key] . "</b>" . ":" . $values . " " . $unit . "   ";
            }

            echo "</div>";
            echo "<div class='EmailElement'>";

            foreach ($url as $chunks) {
                echo "<img style = 'float: left; 'src=" . $chunks->url2 . ">";
            }

            echo "</div>";
            echo "<br><br>";
            echo "</div>";
        }
    }

    wp_die();
}

add_action('woocommerceExtraOrderInfo', 'GrabExtraOrderInfo', 10, 1);
?>
