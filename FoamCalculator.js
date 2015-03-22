/* This script runs the foam calculator. 
 * It will utilise hooked methods from the functions.php file and my own ajax php file
 * Written by George Lane 2014
 */
jQuery(document).ready(function($)
{
    var price = 0;
    var Foamname, cushiontotalwithvat, quantityFinal;
    var dimensionsFinal = [];
    var dimensionsFinalCopy = [];
    extrasobject = {};
    extrasobject.polywrapextra = {};
    extrasobject.polywrapextra.id = 0;
    extrasobject.topperextra = {};
    extrasobject.topperextra.id = 0;
    extrasobject.holesextra = {};
    extrasobject.holesextra.id = 0;
    extrasobject.stockinetteextra = {};
    extrasobject.stockinetteextra.id = 0;
    var ShapeId, inchcm;
    var maxmin;
    var currentrate = 0;
    var ddboxdraw = false;

    $("#Addedtocart").hide();   //
    $("#TemplateButton").hide(); // Initially hide some stuff.. //
    $("#UnitBox").hide();        //
    $("#QuoteBox").hide();
    $("#Sideinfo1").hide();
    $("#Sideinfo2").hide();
    $("#Sideinfo3").hide();
    $("#Sideinfo4").hide();
    $("#FoamInfo2").hide();

    function JobType() // Short lists the foam for the job
    {
        $('#calculate').off('click');
        $('[id=Product]').attr('disabled', 'disabled');
        $('#foamType1,#foamType2').attr('disabled', 'disabled');
        $("#JobInfoContainer").hide();
        $("#FoamInfoContainer").hide();
        $("#LoadJob").show();
        $("#LoadFoam").show();
        $("#foamType1,#foamType2").empty();
        var jobid = $("#Product").val();
        var data = {
            'action': 'type_call',
            'jobid': jobid
        };

        $.post(ajaxurl, data, function(response)
        {
            response = JSON.parse(response);

            var jobname = response[0].jobname;
            var jobdescription = response[0].jobdescription;
            var joburl = response[0].url;
            $("#JobInfoTitle").html(jobname);
            $("#JobInfoDescription").html(jobdescription);
            $("#JobInfoImage").html("<img src=" + joburl + ">");

            $('#foamType1,#foamType2').append($('<option>').text(response[1].name).val(response[1].id));

            for (var i = 2; i < response.length; i++)
            {
                $('#foamType1,#foamType2').append($('<option>').text(response[i].name).val(response[i].id));
            }

            $("[id=LoadJob]").hide();
            $("[id=JobInfoContainer]").show();
            if (i >= 2) {
                foamget(1);
            }
        });


    }
    ;
    function foamget(boxid) // Grabs the selected foam type for the foam selector
    {
        $('#calculate').off('click');
        $("[id=SheetInfoTitle]").empty();
        $('[id=Product]').attr('disabled', 'disabled');
        $('#foamType1, #foamType2').attr('disabled', 'disabled');
        $("[id=FoamInfoContainer]").hide();
        $("[id=LoadFoam]").show();
        $("[id=LoadSheet]").show();
        $("#dropdownZ").empty();

        if (boxid === 1)
        {
            $("#foamType2").select().val($("#foamType1").val());
        }
        else
        {
            $("#foamType1").select().val($("#foamType2").val());
        }

        var foam_id = $("#foamType1").val();
        var data = {
            'action': 'foam_call',
            'foamid': foam_id
        };
        $.post(ajaxurl, data, function(response)
        {
            price = 0;
            maxmin = [];
            var AJAXresponse = response.split('||');
            Foamname = AJAXresponse[0];
            price = AJAXresponse[1];
            var description = AJAXresponse[2];
            var colour = AJAXresponse[3];
            var url = AJAXresponse[4];
            var sheetsize = AJAXresponse[5].split(',');
            maxmin = AJAXresponse[6].split(',');
            $("[id=InfoTitle]").html(Foamname);
            $("[id=InfoDescripton]").html(description);
            $("[id=InfoImage]").html("<img src=" + url + ">");
            $("[id=InfoPrice]").html(price);
            $("[id=InfoColour]").html("The foam is " + colour + " in colour.");
            $("[id=SheetInfoTitle]").html("<center> Sheet Size: " + sheetsize[0] + " " + sheetsize[1] + "</center>");

            $("[id=FoamInfoContainer]").show();
            $("[id=LoadFoam]").hide();
            $("[id=LoadSheet]").hide();
            $('[id=Product]').removeAttr('disabled');
            $('#foamType1,#foamType2').removeAttr('disabled');

            DDboxfill();

            $("#calculate").on('click', function()
            {
                if ($("#ShapeFormID").valid() && $("#quant").valid() && $("#DropDownContainer").valid())
                {
                    CalculateAJAX();
                }
                else {
                    $('#errordiv').html("There is an error. You must correct it before you can continue.");
                }
            });

        });
    }

    function DDboxfill()
    {
        var sizearray = ["0.25", "0.50", "1", "1.5", "2", "2.5", "3", "3.5", "4.0",
            "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];
        inchcm = $("#UnitSelect").val();
        $("#dropdownZ").empty();
        $(".labels").text(" " + $("#UnitSelect option:selected").text());

        if (currentrate != inchcm)
        {
            currentrate = inchcm;

            if (inchcm == 1)
            {
                for (var j = 0; j < sizearray.length; j++)
                {
                    var size = SizeConverter(0, 0, sizearray[j], inchcm);
                    $("#dropdownZ").append($('<option>').text(size[2]).val(size[2]));
                }
                var converttemp1 = SizeConverter(0, 0, maxmin[0], inchcm);
                maxmin[0] = converttemp1[2];
                var converttemp2 = SizeConverter(0, 0, maxmin[1], inchcm);
                maxmin[1] = converttemp2[2];
            }
            else
            {
                for (var j = 0; j < sizearray.length; j++)
                {
                    $("#dropdownZ").append($('<option>').text(sizearray[j]).val(sizearray[j]));
                }
                var converttemp1 = SizeConverter(0, 0, maxmin[0], inchcm);
                maxmin[0] = converttemp1[2];
                var converttemp2 = SizeConverter(0, 0, maxmin[1], inchcm);
                maxmin[1] = converttemp2[2];
            }
        }
        else
        {
            if (inchcm == 1)
            {
                for (var j = 0; j < sizearray.length; j++)
                {
                    var size = SizeConverter(0, 0, sizearray[j], inchcm);
                    $("#dropdownZ").append($('<option>').text(size[2]).val(size[2]));
                }
                var converttemp1 = SizeConverter(0, 0, maxmin[0], inchcm);
                maxmin[0] = converttemp1[2];
                var converttemp2 = SizeConverter(0, 0, maxmin[1], inchcm);
                maxmin[1] = converttemp2[2];
            }
            else
            {
                for (var j = 0; j < sizearray.length; j++)
                {
                    $("#dropdownZ").append($('<option>').text(sizearray[j]).val(sizearray[j]));
                }
            }
        }

        $('#DropDownContainer').validate({
            focusInvalid: false,
            errorPlacement: function(error, element) {
                error.insertAfter(element);
            }
        });

        $('.DDOveride').each(function() {
            $(this).rules('add', {
                min: parseFloat(maxmin[0]),
                max: parseFloat(maxmin[1]),
                messages: {
                    min: "This foam cannot be cut this thin. Please select a thicker size.",
                    max: "This foam cannot be cut this thick. Please select a thinner size."
                }
            });
        });

    }
    function PolyBox()
    {
        if (($("#polywrap").prop('checked')))
        {
            $("#stockinette").attr("disabled", true);
            $("#Checkboxes4").append("<label id='polyselect' class='error' style='display: inline;'><br>Can not select stockinette as polywrap includes it within the price</label>");
            GrabExtrasAjax(0);
        }
        else if ((!$("#polywrap").prop('checked')))
        {
            extrasobject.polywrapextra.id = 0;
            $("#stockinette").attr("disabled", false);
            $("#polyselect").remove();
            $("#Sideinfo1").hide();
        }
    }
    function StockBox()
    {
        if (($("#stockinette").prop('checked')))
        {
            $("#polywrap").attr("disabled", true);
            $("#Checkboxes1").append("<label id='stockselect' class='error' style='display: inline;'><br>Can not select polywrap as it includes stockinette within the price</label>");
            GrabExtrasAjax(3);
        }
        else if ((!$("#stockinette").prop('checked')))
        {
            extrasobject.stockinetteextra.id = 0;
            $("#polywrap").attr("disabled", false);
            $("#stockselect").remove();
            $("#Sideinfo4").hide();
        }
    }
    function HolesBox()
    {

        if (($("#holes").prop('checked')))
        {
            GrabExtrasAjax(2);
        }
        else if ((!$("#holes").prop('checked')))
        {
            extrasobject.holesextra.id = 0;
            $("#Sideinfo3").hide();
        }
    }
    function TopperBox()
    {
        if (($("#topper").prop('checked')))
        {
            GrabExtrasAjax(1);
        }
        else if ((!$("#topper").prop('checked')))
        {
            extrasobject.topperextra.id = 0;
            $("#Sideinfo2").hide();
        }

    }

    function GrabExtrasAjax(type) // Gets the polyester wrap details
    {
        var wrap_id = $("#Polylistbox").val();
        var wrap_name = $("#Polylistbox option:selected").text();

        var topper_id = $("#TopperTypeList").val();
        var topper_name = $("#TopperTypeList option:selected").text();

        var holes_id = $("#HolesTypeList").val();
        var holes_name = $("#HolesTypeList option:selected").text();

        var stockinette_id = 27;

        if (type === 0) {
            extrasobject.polywrapextra.id = wrap_id;
            extrasobject.polywrapextra.name = wrap_name;
            $("#Sideinfo1").show();
            $("#WrapInfoContainer").hide();
            $("#LoadWrap").show();
        }
        if (type === 1) {
            extrasobject.topperextra.id = topper_id;
            extrasobject.topperextra.name = topper_name;
            $("#Sideinfo2").show();
            $("#TopperInfoContainer").hide();
            $("#LoadTopper").show();
        }
        if (type === 2) {
            extrasobject.holesextra.id = holes_id;
            extrasobject.holesextra.name = holes_name;
            $("#Sideinfo3").show();
            $("#HolesInfoContainer").hide();
            $("#LoadHoles").show();
        }
        if (type === 3) {
            extrasobject.polywrapextra.id = stockinette_id;
            extrasobject.polywrapextra.name = "Stockinette";
            $("#Sideinfo4").show();
            $("#StockinetteInfoContainer").hide();
            $("#LoadStockinette").show();
        }


        var data = {'action': 'extras_call',
            'wrapid': wrap_id,
            'topperid': topper_id,
            'holesid': holes_id,
            'Stockinetteid': stockinette_id};

        $.post(ajaxurl, data, function(response)
        {
            var AJAXresponse = response.split('||');
            if (type === 0) {
                $("#PolywrapTitle").html(AJAXresponse[0]);
                $("#PolywrapDescription").html(AJAXresponse[1]);
                $("#PolywrapImage").html("<img src=" + AJAXresponse[2] + ">");
                $("#WrapInfoContainer").show();
                $("#LoadWrap").hide();
            }
            if (type === 1) {
                $("#TopperTitle").html(AJAXresponse[3]);
                $("#TopperDescription").html(AJAXresponse[4]);
                $("#TopperImage").html("<img src=" + AJAXresponse[5] + ">");
                $("#TopperInfoContainer").show();
                $("#LoadTopper").hide();
            }
            if (type === 2) {
                $("#HolesTitle").html(AJAXresponse[6]);
                $("#HolesDescription").html(AJAXresponse[7]);
                $("#HolesImage").html("<img src=" + AJAXresponse[8] + ">");
                $("#HolesInfoContainer").show();
                $("#LoadHoles").hide();
            }
            if (type === 3) {
                $("#StockinetteTitle").html(AJAXresponse[9]);
                $("#StockinetteDescription").html(AJAXresponse[10]);
                $("#StockinetteImage").html("<img src=" + AJAXresponse[11] + ">");

                $("#StockinetteInfoContainer").show();
                $("#LoadStockinette").hide();
            }

        });
    }

    function ShapesAjax(valueobj) // Gets the shape details
    {
        var amount;
        if (valueobj === 1) {
            amount = 1;
        } else {
            amount = valueobj.context.value;
        }
        ;
        $('#calculate').off('click');
        $("#TemplateButton").hide();
        $('#Product').attr('disabled', 'disabled');
        $('[id=foamType]').attr('disabled', 'disabled');
        $('#shape li').off('click');
        $("#ShapeFormID").empty(); //, #DropDownContainer
        $("#ShapeInfoContainer").hide();
        $("#LoadShape").show();
        var foamtype = $("[id=foamType]").val();
        ShapeId = amount;


        var data = {
            'action': 'shape_call',
            'shapeid': amount,
            'foamid': foamtype
        };


        $.post(ajaxurl, data, function(response)
        {
            $("#shapeinfo input").remove();
            $("#UnitBox").show(); //Show the unit box after selection 

            var AJAXresponse = response.split('||');
            var name = AJAXresponse[0];
            var url = AJAXresponse[1];
            var coords = AJAXresponse[2];
            var c = coords.split('`');
            if (amount === 12)
            {
                $("#TemplateButton").prepend("If you would like a shape which is not shown, please provide us with a template\n\
                                         and send it to us with our order form");
                $("#TemplateButton").show();
            }
            else
            {
                for (var i = 0; i < c.length - 2; i++)
                {
                    var d = c[i].split(',');

                    var x = [];
                    var y = [];
                    x.push(d[0]);
                    y.push(d[1]);

                    $("#ShapeFormID").append("<div id=ContainerBox_" + i + ">");
                    $("#ContainerBox_" + i).css({'position': 'absolute', 'top': +x + 'px', 'left': +y + 'px', 'width': '100px', 'height': '20px'});
                    $("#ContainerBox_" + i).prepend("<input class='BoxOveride' type='text' name=Box_" + i + " placeholder='0' >");
                    $("#ContainerBox_" + i).append("<label class='labels'> " + $("#UnitSelect option:selected").text() + "</label>");
                }
                
                    var d = c[i].split(',');
                    var xx = [];
                    var yy = [];
                    xx.push(d[0]);
                    yy.push(d[1]);

                if (ddboxdraw == false)
                {
                    $("#DropDownContainer").append("<div id=DropDownBox>");
                    $("#DropDownBox").prepend("<select class='DDOveride' id=dropdownZ>");
                    $("#DropDownBox").css({'position': 'absolute', 'top': +xx + 'px', 'left': +yy + 'px', 'width': '100px', 'height': '20px'});
                    $("#DropDownBox").append("<label class='labels'> " + $("#UnitSelect option:selected").text() + "</label>");
                    ddboxdraw = true;
                }
                else
                {
                    $("#DropDownBox").css({'position': 'absolute', 'top': +xx + 'px', 'left': +yy + 'px', 'width': '100px', 'height': '20px'});
                }
            }

            $('#shape li').on('click', function() {
                ShapesAjax($(this));
            });

            $("#calculate").on('click', function()
            {
                if ($("#ShapeFormID").valid() && $("#quant").valid() && $("#DropDownContainer").valid())
                {
                    CalculateAJAX();
                }
                else {
                    $('#errordiv').html("There is an error. You must correct it before you can continue.");
                }
            });

            $('#ShapeFormID').validate({
                focusInvalid: false,
                errorPlacement: function(error, element) {
                    error.insertAfter(element);
                }

            });

            $('.BoxOveride').each(function() {
                $(this).rules('add', {
                    required: true,
                    number: true,
                    min: 0.25,
                    max: 500,
                    messages: {
                        required: "Please enter a measurement",
                        number: "Please enter a number",
                        min: "Please enter a number higher than '0.25'",
                        max: "Please enter a number lower than '500'"
                    }
                });
            });

            $("#ShapeTitle").html(name);
            $("#ShapeImage").html("<img src=" + url + ">");

            $("#LoadShape").hide();
            $("#ShapeInfoContainer").show();
            $('[id=Product]').removeAttr('disabled');
        });
    }
    // Used to convert custom sizes into the correct rate. 
    // unitdirection is a flag. 1 is inches into other rate and 0 is other rates into inches
    function SizeConverter(x, y, z, conversion)
    {
        // dimensionarray
        var dimensionarray = [];
        // Conversion rates (inch,cm)
        var cmrate = 0.393700787;

        if (conversion == 1)
        {
            x = x / cmrate;
            y = y / cmrate;
            z = z / cmrate;
        }
        else
        {
            x = x * cmrate;
            y = y * cmrate;
            z = z * cmrate;
        }

        x = x.toFixed(0);
        y = y.toFixed(0);
        z = z.toFixed(1);

        dimensionarray = [x, y, z];

        return dimensionarray;

    }

    function RawPrice(dimensions, price) // Works out the raw price of the foam. (Without extras)
    {
        var x, y, z, divisionrate, total;

        divisionrate = 144;

        x = dimensions[0];
        y = dimensions[1];
        z = dimensions[2];

        divisionrate = x * y / divisionrate;
        price = z * price;
        total = divisionrate * price;

        total = total.toFixed(2);

        return total;

    }

    function CalculateAJAX()
    {
        $('#calculate').off('click');
        $("#errordiv").empty();
        $("#buttons").hide();
        
        $("#QuoteDescription").empty();
        $("#QuoteQuantityCont").empty();
        $("#QuoteTotalPriceCont").empty();
        
        $("#QuoteBox").show();
        $("#QuoteContent").hide();
        $("#Load").show();
        var inchcm = $("#UnitSelect").val();
        // Calculates the extras and the cost  //
        quantityFinal = $("#quantity").val();        //
        var squareFeet, wrapPointer, bondingCharge, overallTopperPrice = 0, cushiontotal = 0, //
                Wrap = 0, Holes = 0, NetPrice = 0, VatPrice = 0;                          //  Reset variables
        GrossPrice = 0;

        var dimensionsArray = [];
        dimensionsArray[0] = $("input[name='Box_0']").val();
        dimensionsArray[1] = $("input[name='Box_1']").val();
        if (!dimensionsArray[1] >= 1) {
            dimensionsArray[1] = dimensionsArray[0];
        } // This ensures that the y dim is the same as the x on the cylinder shape       
        dimensionsArray[2] = $("#dropdownZ option:selected").text();

        dimensionsFinalCopy = dimensionsArray;

        // change back to inches for calculation. The copy above retains the correct size for processesing
        if (inchcm == 1)
        {
            dimensionsFinal = SizeConverter(dimensionsArray[0], dimensionsArray[1], dimensionsArray[2], 0);
        }
        else
        {
            for (var i = 0; i < dimensionsArray.length; i++)
            {
                dimensionsFinal.push(dimensionsArray[i]);
            }
        }
        // add extra dimensions to the array
        for (var i = 2; i < $("#ShapeFormID div").length; i++)
        {
            dimensionsFinal.push($("input[name='Box_" + i + "']").val());
            dimensionsFinalCopy.push($("input[name='Box_" + i + "']").val());
        }

        // calculate price from foam type and measurements                           
        var rawprice = RawPrice(dimensionsFinal, price);

        if (rawprice < 2) {
            rawprice = 2;
        } //Enforce the minimum price of £2

        // Wrap calculator
        squareFeet = dimensionsFinal[0] * dimensionsFinal[1] / 144;

        squareFeet = squareFeet.toFixed(1);

        if (squareFeet > 0 && squareFeet < 2)
            wrapPointer = 9;
        else if (squareFeet >= 2.1 && squareFeet <= 3.6)
            wrapPointer = 10;
        else if (squareFeet >= 3.7 && squareFeet <= 6.1)
            wrapPointer = 11;
        else if (squareFeet >= 6.2 && squareFeet <= 9)
            wrapPointer = 12;
        else if (squareFeet >= 9.1 && squareFeet <= 12)
            wrapPointer = 13;
        else if (squareFeet >= 12.1 && squareFeet <= 15)
            wrapPointer = 14;
        else if (squareFeet >= 15.1 && squareFeet <= 24)
            wrapPointer = 15;
        else if (squareFeet >= 24.1)
            wrapPointer = 16;
        var WrapData = {
            'action': 'wrap_price_call',
            'wrapPriceid': wrapPointer,
            'wrapColumnid': extrasobject.polywrapextra.id};

        var TopperData = {
            'action': 'topper_price_call',
            'topperid': extrasobject.topperextra.id};


        var HolesData = {
            'action': 'holes_price_call',
            'holesid': extrasobject.holesextra.id};

        $.when(
                $.post(ajaxurl, WrapData, function(response)
                {

                    if ($("#polywrap").is(':checked') || $("#stockinette").is(':checked'))
                    {
                        Wrap = response;
                    }
                }),
                $.post(ajaxurl, TopperData, function(response)
                {
                    if ($("#topper").is(':checked'))
                    {

                        if ($("#TopperTypeList").val() >= 23) {
                            dimensionsFinal[2] = "2";
                        } else {
                            dimensionsFinal[2] = "1";
                        }
                        overallTopperPrice = RawPrice(dimensionsFinal, response);

                        bondingCharge = overallTopperPrice * 0.10;
                        bondingCharge = bondingCharge.toFixed(2);

                        overallTopperPrice = parseFloat(overallTopperPrice) + parseFloat(bondingCharge);
                        overallTopperPrice = overallTopperPrice.toFixed(2);

                    }
                }),
                $.post(ajaxurl, HolesData, function(response)
                {
                    if ($("#holes").is(':checked'))
                    {
                        Holes = response;
                    }
                })
                ).then(function() {

            cushiontotal = parseFloat(rawprice) + parseFloat(Wrap) + parseFloat(overallTopperPrice) + parseFloat(Holes);
            cushiontotal = cushiontotal.toFixed(2);
            // cushion total with VAT for the cart
            var vattemp = cushiontotal * 0.20;
            cushiontotalwithvat = parseFloat(cushiontotal) + parseFloat(vattemp);
            // Quantity
            $("#QuoteQuantityCont").html("<div class='QuoteBoxElementCont' id='QuoteQuantity'>Quantity:</div>");
            $("#QuoteQuantity").append("<div class='QuoteBoxElement'>" + quantityFinal + "</div>");

            NetPrice = cushiontotal * quantityFinal;
            NetPrice = NetPrice.toFixed(2);

            VatPrice = NetPrice * 0.20;
            VatPrice = VatPrice.toFixed(2);

            var GrossPrice = parseFloat(NetPrice) + parseFloat(VatPrice);
            GrossPrice = GrossPrice.toFixed(2);
            //Gross
            $("#QuoteTotalPriceCont").html("<div class='QuoteBoxElementCont' id='QuoteTotalPrice'>TOTAL:</div>");
            $("#QuoteTotalPrice").append("<div class='QuoteTotalElement'>&pound" + GrossPrice + "</div>");

            //Quote description
            $("#QuoteDescription").empty();
            
            $("#QuoteDescription").html("<b>"+Foamname+"</b>");
            
            $("#QuoteDescription").append("<br><b>Dimensions:</b> " + dimensionsFinalCopy + " " + $("#UnitSelect option:selected").text());           
            
            if (extrasobject.polywrapextra.id > 0)
            {
                $("#QuoteDescription").append("<br><b>Polywrap:</b> " + extrasobject.polywrapextra.name);
            }
            
            if (extrasobject.topperextra.id > 0)
            {
                $("#QuoteDescription").append("<br><b>Topper:</b> " + extrasobject.topperextra.name);
            }
            
            if (extrasobject.holesextra.id > 0)
            {
                $("#QuoteDescription").append("<br><b>Holes:</b> " + extrasobject.holesextra.name);
            }

            if (extrasobject.stockinetteextra.id > 0)
            {
                $("#QuoteDescription").append("<br>Stockinette: " + extrasobject.stockinetteextra.name);
            }
   
            $("#Load").hide();
            $("#QuoteContent").show();
            $("#buttons").show();
            $("#calculate").show();
            $("#FoamInfo2").show();

            console.log("Rawprice: " + rawprice);
            console.log("Wrap: " + Wrap);
            console.log("Topper: " + overallTopperPrice);
            console.log("Holes: " + Holes);
            console.log("cushion total: " + cushiontotal);
            console.log("net: " + NetPrice);
            console.log("vat: " + VatPrice);
            console.log("total: " + GrossPrice);

            $("#calculate").on('click', function()
            {
                if ($("#ShapeFormID").valid() && $("#quant").valid() && $("#DropDownContainer").valid())
                {
                    CalculateAJAX();
                }
                else {
                    $('#errordiv').html("There is an error. You must correct it before you can continue.");
                }
            });

        });

    }

// EVENT LISTENERS 

    // Shape selection fires
    $('#shape li').on('click', function() {
        ShapesAjax($(this));
    });
    ShapesAjax(1);
    $('#addtocartid').on('click', function()
    {
        var measurementunit = $("#UnitSelect option:selected").text();
        $("#featurecontent").hide();
        $("#AddedMessage").hide();
        $("#Addedtocart").show();
        var data = {
            'action': 'create_product',
            'name': 'Foam: ' + Foamname + ' Size: ' + dimensionsFinalCopy[0] +
                    measurementunit + ' x ' + dimensionsFinalCopy[1] + measurementunit + ' x ' + dimensionsFinalCopy[2] + measurementunit,
            'foamprice': cushiontotalwithvat,
            'dimensions': dimensionsFinalCopy,
            'quantity': quantityFinal,
            'shapeid': ShapeId,
            'polywrapid': extrasobject.polywrapextra.id,
            'topperid': extrasobject.topperextra.id,
            'holesid': extrasobject.holesextra.id,
            'stockinetteid': extrasobject.stockinetteextra.id,
            'unit': measurementunit,
            'foam': true
        };
        $.post(ajaxurl, data, function(response)
        {

            $("#AddedMessage").html("Foam added to cart! <br><br> Page is now reloading...");
            $("#AddedMessage").show();

            location.reload();

        });
    });
    $("#printid").on('click', function()
    {
        $("QuoteBox").printElement();
    });

    // Get Jobs on job change 
    $("#Product").change(function() {
        JobType();
    });
    // Get Foam on listbox change
    $("#foamType1").change(function() {
        foamget(1);
    });
    // Get Foam on second listbox change
    $("#foamType2").change(function() {
        foamget(2);
    });
    // Run poly ajax on checked
    $("#Polylistbox").change(function() {
        GrabExtrasAjax(0);
    });
    if (($("#polywrap").prop('checked'))) {
        GrabExtrasAjax(0);
    }
    ;
    // Run topper ajax on listbox change
    $("#TopperTypeList").change(function() {
        GrabExtrasAjax(1);
    });
    if (($("#topper").prop('checked'))) {
        GrabExtrasAjax(1);
    }
    ;
    // Run holes ajax on listbox change
    $("#HolesTypeList").change(function() {
        GrabExtrasAjax(2);
    });
    if (($("#holes").prop('checked'))) {
        GrabExtrasAjax(2);
    }
    ;
    // Run stockinette ajax on listbox change
    if (($("#stockinette").prop('checked'))) {
        GrabExtrasAjax(3);
    }
    ;
    // Tick box fires
    $("#polywrap").change(PolyBox);
    $("#stockinette").change(StockBox);
    $("#topper").change(TopperBox);
    $("#holes").change(HolesBox);
    //Fire on dimention type box change          
    $("#UnitSelect").change(function() {
        DDboxfill();
    });
    // Form Validation  
    $('#quant').validate({
        rules: {
            quantity:
                    {
                        number: true,
                        maxlength: 100,
                        minlength: 1
                    }
        },
        errorPlacement: function(error) {
            error.insertAfter("#quantity");
        }
    });

    JobType();
});
