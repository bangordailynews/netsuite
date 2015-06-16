//This script will need to be added to NetSuite as a User Event script.
//Before Submit Function is generateInvoiceScanLine

//When you deploy, set Applies To invoice and give access to all roles and all employees.

//Documentation from FISC is below

//In order to verify the accuracy of the data read, clients are encouraged to 
//use check digit routines, in particular for the entire scanline and for the 
//account number field.

//A check digit routine is a mathematical equation using a weight system
//or algorithm to calculate a number that validates the accuracy of data 
//printed or transmitted. The same check digit validation routine should be 
//used for all document types.
//For example: data reads 0123456789000008975

//Weight is 21

//data becomes			0 1 2 3 4 5 6 7 8 9 0 0 0 0 0 8 9 7 5
//multiplied by			2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2 1 2
//data weighted reads	0 1 4 3 8 5 12 7 16 9 0 0 0 0 0 8 18 7 10

//Add digits: 1+4+3+8+5+1+2+7+1+6+9+8+1+8+7+1 = 72

//Divide sum by 10: 72/10 = 7 with remainder of 2

//10 - 2 = 8 for Check Digit

//Data with Check Digit: 01234567890000089758


function generateInvoiceScanLine() {
	
	//Customer Internal ID
	customer = nlapiGetFieldValue( 'entity' );
	//Invoice Total
	total = nlapiGetFieldValue( 'total' );
	//Invoice Internal ID
	invoice = nlapiGetFieldValue( 'id' );
	
	//Create our scanline! Cast all the things to strings!
				//Account					//Total 1				//Total 2	//Total 3	//Unused		
	scanline = bdnPad( customer + '', 7, '0' ) + bdnPad( total.replace( /[^0-9]/g, '' ) + '', 7, '0' ) + '0000000' + '0000000' + bdnPad( invoice + '', 7, '0' ) + '';
	
	//Let's pretend our scanline currently equals 11492
	
	//Split it up, so each number is one piece of an array
	checksum = scanline.split( '' );
	
	//array equals [1,1,4,9,2]

	//Multiply each piece of the array by the weight for that position
	for( key = 0; key < checksum.length; key++ ) {
		value = checksum[ key ] * bdnGetWeight();
		checksum[ key ] = value;
	}
	
	//array equals [2,1,8,4,18,2]
	
	//Join, and then split again (so that [2,1,8,4,18,2] becomes [2,1,8,4,1,8,2])
	checksumstring = checksum.join( '' ) + '';
	checksum = checksumstring.split( '' );
	
	//Now, we want to know the total for adding all of the checksum numbers up
	checksumsum = 0;
	for( key = 0; key < checksum.length; key++ ) {
		checksumsum += parseInt( checksum[key] );
	}
	
	//In our above total, [2,1,8,4,1,8,2] should equal 26
	
	checksumno = 10 - ( checksumsum % 10 );
	
	//Now, we want the remainder when we divide by 10, subtracted from 10
	//So, in this case, 26/10 = 2.6, so remainder is 6, subtracted from 10 is 4
	
	if( checksumno == 10 )
		checksumno = 0;
	
	//If the remainder is 10, it's zero

	scanline = scanline + '' + checksumno;
	
	//Add our checksumno to the end of the scanline
	
	//And set the hidden field on the invoice
	//You will need to register this by going to Customization->Lists, Records & Fields->Transaction Body Fields->New. 
	//You will want the field to Display Type hidden, Type free-form text, set the ID to _scanline, applies to sale
	nlapiSetFieldValue( 'custbody_scanline', scanline, false );
	
}

function bdnPad( n, width, z ) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array( width - n.length + 1 ).join( z ) + n;
}

var bdnWeight = 0;
function bdnGetWeight() {
	
	weights = [ 2 , 1 ];
	
	if( bdnWeight > 1 )
		bdnWeight = 0;
	
	weight = weights[ bdnWeight ];
	bdnWeight += 1;
	
	return weight;
	
}
