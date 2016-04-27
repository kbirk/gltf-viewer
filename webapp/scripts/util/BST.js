(function () {

    'use strict';

    function Node( value, index ) {
        this.value = value;
        this.index = index;
        this.less = null;
        this.greater = null;
    }

    Node.prototype.search = function( value, below, above ) {
        if ( value < this.value ) {
            if ( !above || this.value - value < above.value - value ) {
                above = this;
            }
            if ( this.less ) {
                return this.less.search( value, below, above );
            }
        } else {
            if ( !below || value - this.value < value - below.value ) {
                below = this;
            }
            if ( this.greater ) {
                return this.greater.search( value, below, above );
            }
        }
        return {
            from: below,
            to: above
        };
    };

    function createTree( arr, start, end ) {
        if ( start > end ) {
            return null;
        }
        // same as (start+end)/2, avoids overflow.
        var mid = Math.floor( start + ( end - start ) / 2 );
        var node = new Node( arr[ mid ], mid );
        node.less = createTree( arr, start, mid - 1 );
        node.greater = createTree( arr, mid + 1, end );
        return node;
    }

    function BST( arr ) {
        var start = 0;
        var end = arr.length - 1;
        this.min = arr[start];
        this.max = arr[end];
        this.root = createTree( arr, start, end );
    }

    BST.prototype.search = function( value ) {
        if ( value > this.max || value < this.min ) {
            return null;
        }
        return this.root.search( value );
    };

    module.exports = BST;

}());
