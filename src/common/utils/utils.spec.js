describe( 'stringCount', function () {
	var stringCount;

	beforeEach( module( 'utils' ));

	beforeEach( inject( function( _stringCount_ ) {
		stringCount = _stringCount_;
	}));

	it( 'return the correct number occurances when none are found', function() {
		expect( stringCount('here is a text', 'f') ).toBe(0);
	});

	it( 'returns the correct number of occurances', function() {
		var textWithNewLines = 'here is a text without newlines';	
		expect( stringCount(textWithNewLines, 'e') ).toBe(5);
	});

	it( 'returns the correct number of occurances', function() {
		var textWithNewLines = 'here is \n a text \n with \n newlines';	
		expect( stringCount(textWithNewLines, '\n') ).toBe (3);
	});
});