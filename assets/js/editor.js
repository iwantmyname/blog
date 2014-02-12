/*!
 * Markdown
 * Released under MIT license
 * Copyright (c) 2009-2010 Dominic Baggott
 * Copyright (c) 2009-2010 Ash Berlin
 * Copyright (c) 2011 Christoph Dorn <christoph@christophdorn.com> (http://www.christophdorn.com)
 * Version: 0.6.0-beta1
 * Date: 2014-02-12T01:28Z
 */

(function(expose) {

  var MarkdownHelpers = {};

  // For Spidermonkey based engines
  function mk_block_toSource() {
    return "Markdown.mk_block( " +
            uneval(this.toString()) +
            ", " +
            uneval(this.trailing) +
            ", " +
            uneval(this.lineNumber) +
            " )";
  }

  // node
  function mk_block_inspect() {
    var util = require("util");
    return "Markdown.mk_block( " +
            util.inspect(this.toString()) +
            ", " +
            util.inspect(this.trailing) +
            ", " +
            util.inspect(this.lineNumber) +
            " )";

  }

  MarkdownHelpers.mk_block = function(block, trail, line) {
    // Be helpful for default case in tests.
    if ( arguments.length === 1 )
      trail = "\n\n";

    // We actually need a String object, not a string primitive
    /* jshint -W053 */
    var s = new String(block);
    s.trailing = trail;
    // To make it clear its not just a string
    s.inspect = mk_block_inspect;
    s.toSource = mk_block_toSource;

    if ( line !== undefined )
      s.lineNumber = line;

    return s;
  };

  var isArray = MarkdownHelpers.isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };

  // Don't mess with Array.prototype. Its not friendly
  if ( Array.prototype.forEach ) {
    MarkdownHelpers.forEach = function forEach( arr, cb, thisp ) {
      return arr.forEach( cb, thisp );
    };
  }
  else {
    MarkdownHelpers.forEach = function forEach(arr, cb, thisp) {
      for (var i = 0; i < arr.length; i++)
        cb.call(thisp || arr, arr[i], i, arr);
    };
  }

  MarkdownHelpers.isEmpty = function isEmpty( obj ) {
    for ( var key in obj ) {
      if ( hasOwnProperty.call( obj, key ) )
        return false;
    }
    return true;
  };

  MarkdownHelpers.extract_attr = function extract_attr( jsonml ) {
    return isArray(jsonml)
        && jsonml.length > 1
        && typeof jsonml[ 1 ] === "object"
        && !( isArray(jsonml[ 1 ]) )
        ? jsonml[ 1 ]
        : undefined;
  };

 /**
   *  class Markdown
   *
   *  Markdown processing in Javascript done right. We have very particular views
   *  on what constitutes 'right' which include:
   *
   *  - produces well-formed HTML (this means that em and strong nesting is
   *    important)
   *
   *  - has an intermediate representation to allow processing of parsed data (We
   *    in fact have two, both as [JsonML]: a markdown tree and an HTML tree).
   *
   *  - is easily extensible to add new dialects without having to rewrite the
   *    entire parsing mechanics
   *
   *  - has a good test suite
   *
   *  This implementation fulfills all of these (except that the test suite could
   *  do with expanding to automatically run all the fixtures from other Markdown
   *  implementations.)
   *
   *  ##### Intermediate Representation
   *
   *  *TODO* Talk about this :) Its JsonML, but document the node names we use.
   *
   *  [JsonML]: http://jsonml.org/ "JSON Markup Language"
   **/
  var Markdown = function(dialect) {
    switch (typeof dialect) {
    case "undefined":
      this.dialect = Markdown.dialects.Gruber;
      break;
    case "object":
      this.dialect = dialect;
      break;
    default:
      if ( dialect in Markdown.dialects )
        this.dialect = Markdown.dialects[dialect];
      else
        throw new Error("Unknown Markdown dialect '" + String(dialect) + "'");
      break;
    }
    this.em_state = [];
    this.strong_state = [];
    this.debug_indent = "";
  };

  /**
   * Markdown.dialects
   *
   * Namespace of built-in dialects.
   **/
  Markdown.dialects = {};

  // Imported functions
  var mk_block = Markdown.mk_block = MarkdownHelpers.mk_block,
      isArray = MarkdownHelpers.isArray;

  /**
   *  parse( markdown, [dialect] ) -> JsonML
   *  - markdown (String): markdown string to parse
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber
   *
   *  Parse `markdown` and return a markdown document as a Markdown.JsonML tree.
   **/
  Markdown.parse = function( source, dialect ) {
    // dialect will default if undefined
    var md = new Markdown( dialect );
    return md.toTree( source );
  };

  /**
   *  count_lines( str ) -> count
   *  - str (String): String whose lines we want to count
   *
   *  Counts the number of linebreaks in `str`
   **/
  function count_lines( str ) {
    return str.split("\n").length - 1;
  }

  // Internal - split source into rough blocks
  Markdown.prototype.split_blocks = function splitBlocks( input ) {
    // Normalize linebreaks to \n.
    input = input.replace(/\r\n?/g, "\n");
    // Match until the end of the string, a newline followed by #, or two or more newlines.
    // [\s\S] matches _anything_ (newline or space)
    // [^] is equivalent but doesn't work in IEs.
    var re = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g,
        blocks = [],
        m;

    var line_no = 1;

    if ( ( m = /^(\s*\n)/.exec(input) ) !== null ) {
      // skip (but count) leading blank lines
      line_no += count_lines( m[0] );
      re.lastIndex = m[0].length;
    }

    while ( ( m = re.exec(input) ) !== null ) {
      if (m[2] === "\n#") {
        m[2] = "\n";
        re.lastIndex--;
      }
      blocks.push( mk_block( m[1], m[2], line_no ) );
      line_no += count_lines( m[0] );
    }

    return blocks;
  };

  /**
   *  Markdown#processBlock( block, next ) -> undefined | [ JsonML, ... ]
   *  - block (String): the block to process
   *  - next (Array): the following blocks
   *
   * Process `block` and return an array of JsonML nodes representing `block`.
   *
   * It does this by asking each block level function in the dialect to process
   * the block until one can. Succesful handling is indicated by returning an
   * array (with zero or more JsonML nodes), failure by a false value.
   *
   * Blocks handlers are responsible for calling [[Markdown#processInline]]
   * themselves as appropriate.
   *
   * If the blocks were split incorrectly or adjacent blocks need collapsing you
   * can adjust `next` in place using shift/splice etc.
   *
   * If any of this default behaviour is not right for the dialect, you can
   * define a `__call__` method on the dialect that will get invoked to handle
   * the block processing.
   */
  Markdown.prototype.processBlock = function processBlock( block, next ) {
    var cbs = this.dialect.block,
        ord = cbs.__order__;

    if ( "__call__" in cbs )
      return cbs.__call__.call(this, block, next);

    for ( var i = 0; i < ord.length; i++ ) {
      //D:this.debug( "Testing", ord[i] );
      var res = cbs[ ord[i] ].call( this, block, next );
      if ( res ) {

        if ( !isArray(res) || ( res.length > 0 && !( isArray(res[0]) ) && ( typeof res[0] !== "string")) ) {
          this.debug(ord[i], "didn't return proper JsonML");
        }

        return res;
      }
    }

    // Uhoh! no match! Should we throw an error?
    return [];
  };

  Markdown.prototype.processInline = function processInline( block ) {
    return this.dialect.inline.__call__.call( this, String( block ) );
  };

  /**
   *  Markdown#toTree( source ) -> JsonML
   *  - source (String): markdown source to parse
   *
   *  Parse `source` into a JsonML tree representing the markdown document.
   **/
  // custom_tree means set this.tree to `custom_tree` and restore old value on return
  Markdown.prototype.toTree = function toTree( source, custom_root ) {
    var blocks = source instanceof Array ? source : this.split_blocks( source );

    // Make tree a member variable so its easier to mess with in extensions
    var old_tree = this.tree;
    try {
      this.tree = custom_root || this.tree || [ "markdown" ];

      blocks_loop:
      while ( blocks.length ) {
        var b = this.processBlock( blocks.shift(), blocks );

        // Reference blocks and the like won't return any content
        if ( !b.length )
          continue blocks_loop;

        this.tree.push.apply( this.tree, b );
      }
      return this.tree;
    }
    finally {
      if ( custom_root )
        this.tree = old_tree;
    }
  };

  // Noop by default
  Markdown.prototype.debug = function () {
    var args = Array.prototype.slice.call( arguments);
    args.unshift(this.debug_indent);
    if ( typeof print !== "undefined" )
      print.apply( print, args );
    if ( typeof console !== "undefined" && typeof console.log !== "undefined" )
      console.log.apply( null, args );
  };

  Markdown.prototype.loop_re_over_block = function( re, block, cb ) {
    // Dont use /g regexps with this
    var m,
        b = block.valueOf();

    while ( b.length && (m = re.exec(b) ) !== null ) {
      b = b.substr( m[0].length );
      cb.call(this, m);
    }
    return b;
  };

  // Build default order from insertion order.
  Markdown.buildBlockOrder = function(d) {
    var ord = [];
    for ( var i in d ) {
      if ( i === "__order__" || i === "__call__" )
        continue;
      ord.push( i );
    }
    d.__order__ = ord;
  };

  // Build patterns for inline matcher
  Markdown.buildInlinePatterns = function(d) {
    var patterns = [];

    for ( var i in d ) {
      // __foo__ is reserved and not a pattern
      if ( i.match( /^__.*__$/) )
        continue;
      var l = i.replace( /([\\.*+?^$|()\[\]{}])/g, "\\$1" )
               .replace( /\n/, "\\n" );
      patterns.push( i.length === 1 ? l : "(?:" + l + ")" );
    }

    patterns = patterns.join("|");
    d.__patterns__ = patterns;
    //print("patterns:", uneval( patterns ) );

    var fn = d.__call__;
    d.__call__ = function(text, pattern) {
      if ( pattern !== undefined )
        return fn.call(this, text, pattern);
      else
        return fn.call(this, text, patterns);
    };
  };

  var extract_attr = MarkdownHelpers.extract_attr;

  /**
   *  renderJsonML( jsonml[, options] ) -> String
   *  - jsonml (Array): JsonML array to render to XML
   *  - options (Object): options
   *
   *  Converts the given JsonML into well-formed XML.
   *
   *  The options currently understood are:
   *
   *  - root (Boolean): wether or not the root node should be included in the
   *    output, or just its children. The default `false` is to not include the
   *    root itself.
   */
  Markdown.renderJsonML = function( jsonml, options ) {
    options = options || {};
    // include the root element in the rendered output?
    options.root = options.root || false;

    var content = [];

    if ( options.root ) {
      content.push( render_tree( jsonml ) );
    }
    else {
      jsonml.shift(); // get rid of the tag
      if ( jsonml.length && typeof jsonml[ 0 ] === "object" && !( jsonml[ 0 ] instanceof Array ) )
        jsonml.shift(); // get rid of the attributes

      while ( jsonml.length )
        content.push( render_tree( jsonml.shift() ) );
    }

    return content.join( "\n\n" );
  };

  /**
   *  toHTMLTree( markdown, [dialect] ) -> JsonML
   *  toHTMLTree( md_tree ) -> JsonML
   *  - markdown (String): markdown string to parse
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber
   *  - md_tree (Markdown.JsonML): parsed markdown tree
   *
   *  Turn markdown into HTML, represented as a JsonML tree. If a string is given
   *  to this function, it is first parsed into a markdown tree by calling
   *  [[parse]].
   **/
  Markdown.toHTMLTree = function toHTMLTree( input, dialect , options ) {

    // convert string input to an MD tree
    if ( typeof input === "string" )
      input = this.parse( input, dialect );

    // Now convert the MD tree to an HTML tree

    // remove references from the tree
    var attrs = extract_attr( input ),
        refs = {};

    if ( attrs && attrs.references )
      refs = attrs.references;

    var html = convert_tree_to_html( input, refs , options );
    merge_text_nodes( html );
    return html;
  };

  /**
   *  toHTML( markdown, [dialect]  ) -> String
   *  toHTML( md_tree ) -> String
   *  - markdown (String): markdown string to parse
   *  - md_tree (Markdown.JsonML): parsed markdown tree
   *
   *  Take markdown (either as a string or as a JsonML tree) and run it through
   *  [[toHTMLTree]] then turn it into a well-formated HTML fragment.
   **/
  Markdown.toHTML = function toHTML( source , dialect , options ) {
    var input = this.toHTMLTree( source , dialect , options );

    return this.renderJsonML( input );
  };

  function escapeHTML( text ) {
    return text.replace( /&/g, "&amp;" )
               .replace( /</g, "&lt;" )
               .replace( />/g, "&gt;" )
               .replace( /"/g, "&quot;" )
               .replace( /'/g, "&#39;" );
  }

  function render_tree( jsonml ) {
    // basic case
    if ( typeof jsonml === "string" )
      return escapeHTML( jsonml );

    var tag = jsonml.shift(),
        attributes = {},
        content = [];

    if ( jsonml.length && typeof jsonml[ 0 ] === "object" && !( jsonml[ 0 ] instanceof Array ) )
      attributes = jsonml.shift();

    while ( jsonml.length )
      content.push( render_tree( jsonml.shift() ) );

    var tag_attrs = "";
    if (typeof attributes.src !== 'undefined') {
      tag_attrs += ' src="' + escapeHTML( attributes.src ) + '"';
      delete attributes.src;
    }

    for ( var a in attributes )
      tag_attrs += " " + a + '="' + escapeHTML( attributes[ a ] ) + '"';

    // be careful about adding whitespace here for inline elements
    if ( tag === "img" || tag === "br" || tag === "hr" )
      return "<"+ tag + tag_attrs + "/>";
    else
      return "<"+ tag + tag_attrs + ">" + content.join( "" ) + "</" + tag + ">";
  }

  function convert_tree_to_html( tree, references, options ) {
    var i;
    options = options || {};

    // shallow clone
    var jsonml = tree.slice( 0 );

    if ( typeof options.preprocessTreeNode === "function" )
      jsonml = options.preprocessTreeNode(jsonml, references);

    // Clone attributes if they exist
    var attrs = extract_attr( jsonml );
    if ( attrs ) {
      jsonml[ 1 ] = {};
      for ( i in attrs ) {
        jsonml[ 1 ][ i ] = attrs[ i ];
      }
      attrs = jsonml[ 1 ];
    }

    // basic case
    if ( typeof jsonml === "string" )
      return jsonml;

    // convert this node
    switch ( jsonml[ 0 ] ) {
    case "header":
      jsonml[ 0 ] = "h" + jsonml[ 1 ].level;
      delete jsonml[ 1 ].level;
      break;
    case "bulletlist":
      jsonml[ 0 ] = "ul";
      break;
    case "numberlist":
      jsonml[ 0 ] = "ol";
      break;
    case "listitem":
      jsonml[ 0 ] = "li";
      break;
    case "para":
      jsonml[ 0 ] = "p";
      break;
    case "markdown":
      jsonml[ 0 ] = "html";
      if ( attrs )
        delete attrs.references;
      break;
    case "code_block":
      jsonml[ 0 ] = "pre";
      i = attrs ? 2 : 1;
      var code = [ "code" ];
      code.push.apply( code, jsonml.splice( i, jsonml.length - i ) );
      jsonml[ i ] = code;
      break;
    case "inlinecode":
      jsonml[ 0 ] = "code";
      break;
    case "img":
      jsonml[ 1 ].src = jsonml[ 1 ].href;
      delete jsonml[ 1 ].href;
      break;
    case "linebreak":
      jsonml[ 0 ] = "br";
      break;
    case "link":
      jsonml[ 0 ] = "a";
      break;
    case "link_ref":
      jsonml[ 0 ] = "a";

      // grab this ref and clean up the attribute node
      var ref = references[ attrs.ref ];

      // if the reference exists, make the link
      if ( ref ) {
        delete attrs.ref;

        // add in the href and title, if present
        attrs.href = ref.href;
        if ( ref.title )
          attrs.title = ref.title;

        // get rid of the unneeded original text
        delete attrs.original;
      }
      // the reference doesn't exist, so revert to plain text
      else {
        return attrs.original;
      }
      break;
    case "img_ref":
      jsonml[ 0 ] = "img";

      // grab this ref and clean up the attribute node
      var ref = references[ attrs.ref ];

      // if the reference exists, make the link
      if ( ref ) {
        delete attrs.ref;

        // add in the href and title, if present
        attrs.src = ref.href;
        if ( ref.title )
          attrs.title = ref.title;

        // get rid of the unneeded original text
        delete attrs.original;
      }
      // the reference doesn't exist, so revert to plain text
      else {
        return attrs.original;
      }
      break;
    }

    // convert all the children
    i = 1;

    // deal with the attribute node, if it exists
    if ( attrs ) {
      // if there are keys, skip over it
      for ( var key in jsonml[ 1 ] ) {
        i = 2;
        break;
      }
      // if there aren't, remove it
      if ( i === 1 )
        jsonml.splice( i, 1 );
    }

    for ( ; i < jsonml.length; ++i ) {
      jsonml[ i ] = convert_tree_to_html( jsonml[ i ], references, options );
    }

    return jsonml;
  }

  // merges adjacent text nodes into a single node
  function merge_text_nodes( jsonml ) {
    // skip the tag name and attribute hash
    var i = extract_attr( jsonml ) ? 2 : 1;

    while ( i < jsonml.length ) {
      // if it's a string check the next item too
      if ( typeof jsonml[ i ] === "string" ) {
        if ( i + 1 < jsonml.length && typeof jsonml[ i + 1 ] === "string" ) {
          // merge the second string into the first and remove it
          jsonml[ i ] += jsonml.splice( i + 1, 1 )[ 0 ];
        }
        else {
          ++i;
        }
      }
      // if it's not a string recurse
      else {
        merge_text_nodes( jsonml[ i ] );
        ++i;
      }
    }
  }

  var DialectHelpers = {};
  DialectHelpers.inline_until_char = function( text, want ) {
    var consumed = 0,
        nodes = [];

    while ( true ) {
      if ( text.charAt( consumed ) === want ) {
        // Found the character we were looking for
        consumed++;
        return [ consumed, nodes ];
      }

      if ( consumed >= text.length ) {
        // No closing char found. Abort.
        return [consumed, null, nodes];
      }

      var res = this.dialect.inline.__oneElement__.call(this, text.substr( consumed ) );
      consumed += res[ 0 ];
      // Add any returned nodes.
      nodes.push.apply( nodes, res.slice( 1 ) );
    }
  };

  // Helper function to make sub-classing a dialect easier
  DialectHelpers.subclassDialect = function( d ) {
    function Block() {}
    Block.prototype = d.block;
    function Inline() {}
    Inline.prototype = d.inline;

    return { block: new Block(), inline: new Inline() };
  };

  var forEach = MarkdownHelpers.forEach,
      extract_attr = MarkdownHelpers.extract_attr,
      mk_block = MarkdownHelpers.mk_block,
      isEmpty = MarkdownHelpers.isEmpty,
      inline_until_char = DialectHelpers.inline_until_char;

  /**
   * Gruber dialect
   *
   * The default dialect that follows the rules set out by John Gruber's
   * markdown.pl as closely as possible. Well actually we follow the behaviour of
   * that script which in some places is not exactly what the syntax web page
   * says.
   **/
  var Gruber = {
    block: {
      atxHeader: function atxHeader( block, next ) {
        var m = block.match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ );

        if ( !m )
          return undefined;

        var header = [ "header", { level: m[ 1 ].length } ];
        Array.prototype.push.apply(header, this.processInline(m[ 2 ]));

        if ( m[0].length < block.length )
          next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );

        return [ header ];
      },

      setextHeader: function setextHeader( block, next ) {
        var m = block.match( /^(.*)\n([-=])\2\2+(?:\n|$)/ );

        if ( !m )
          return undefined;

        var level = ( m[ 2 ] === "=" ) ? 1 : 2,
            header = [ "header", { level : level } ].concat( this.processInline(m[ 1 ]) );

        if ( m[0].length < block.length )
          next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );

        return [ header ];
      },

      code: function code( block, next ) {
        // |    Foo
        // |bar
        // should be a code block followed by a paragraph. Fun
        //
        // There might also be adjacent code block to merge.

        var ret = [],
            re = /^(?: {0,3}\t| {4})(.*)\n?/;

        // 4 spaces + content
        if ( !block.match( re ) )
          return undefined;

        block_search:
        do {
          // Now pull out the rest of the lines
          var b = this.loop_re_over_block(
                    re, block.valueOf(), function( m ) { ret.push( m[1] ); } );

          if ( b.length ) {
            // Case alluded to in first comment. push it back on as a new block
            next.unshift( mk_block(b, block.trailing) );
            break block_search;
          }
          else if ( next.length ) {
            // Check the next block - it might be code too
            if ( !next[0].match( re ) )
              break block_search;

            // Pull how how many blanks lines follow - minus two to account for .join
            ret.push ( block.trailing.replace(/[^\n]/g, "").substring(2) );

            block = next.shift();
          }
          else {
            break block_search;
          }
        } while ( true );

        return [ [ "code_block", ret.join("\n") ] ];
      },

      horizRule: function horizRule( block, next ) {
        // this needs to find any hr in the block to handle abutting blocks
        var m = block.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );

        if ( !m )
          return undefined;

        var jsonml = [ [ "hr" ] ];

        // if there's a leading abutting block, process it
        if ( m[ 1 ] ) {
          var contained = mk_block( m[ 1 ], "", block.lineNumber );
          jsonml.unshift.apply( jsonml, this.toTree( contained, [] ) );
        }

        // if there's a trailing abutting block, stick it into next
        if ( m[ 3 ] )
          next.unshift( mk_block( m[ 3 ], block.trailing, block.lineNumber + 1 ) );

        return jsonml;
      },

      // There are two types of lists. Tight and loose. Tight lists have no whitespace
      // between the items (and result in text just in the <li>) and loose lists,
      // which have an empty line between list items, resulting in (one or more)
      // paragraphs inside the <li>.
      //
      // There are all sorts weird edge cases about the original markdown.pl's
      // handling of lists:
      //
      // * Nested lists are supposed to be indented by four chars per level. But
      //   if they aren't, you can get a nested list by indenting by less than
      //   four so long as the indent doesn't match an indent of an existing list
      //   item in the 'nest stack'.
      //
      // * The type of the list (bullet or number) is controlled just by the
      //    first item at the indent. Subsequent changes are ignored unless they
      //    are for nested lists
      //
      lists: (function( ) {
        // Use a closure to hide a few variables.
        var any_list = "[*+-]|\\d+\\.",
            bullet_list = /[*+-]/,
            // Capture leading indent as it matters for determining nested lists.
            is_list_re = new RegExp( "^( {0,3})(" + any_list + ")[ \t]+" ),
            indent_re = "(?: {0,3}\\t| {4})";

        // TODO: Cache this regexp for certain depths.
        // Create a regexp suitable for matching an li for a given stack depth
        function regex_for_depth( depth ) {

          return new RegExp(
            // m[1] = indent, m[2] = list_type
            "(?:^(" + indent_re + "{0," + depth + "} {0,3})(" + any_list + ")\\s+)|" +
            // m[3] = cont
            "(^" + indent_re + "{0," + (depth-1) + "}[ ]{0,4})"
          );
        }
        function expand_tab( input ) {
          return input.replace( / {0,3}\t/g, "    " );
        }

        // Add inline content `inline` to `li`. inline comes from processInline
        // so is an array of content
        function add(li, loose, inline, nl) {
          if ( loose ) {
            li.push( [ "para" ].concat(inline) );
            return;
          }
          // Hmmm, should this be any block level element or just paras?
          var add_to = li[li.length -1] instanceof Array && li[li.length - 1][0] === "para"
                     ? li[li.length -1]
                     : li;

          // If there is already some content in this list, add the new line in
          if ( nl && li.length > 1 )
            inline.unshift(nl);

          for ( var i = 0; i < inline.length; i++ ) {
            var what = inline[i],
                is_str = typeof what === "string";
            if ( is_str && add_to.length > 1 && typeof add_to[add_to.length-1] === "string" )
              add_to[ add_to.length-1 ] += what;
            else
              add_to.push( what );
          }
        }

        // contained means have an indent greater than the current one. On
        // *every* line in the block
        function get_contained_blocks( depth, blocks ) {

          var re = new RegExp( "^(" + indent_re + "{" + depth + "}.*?\\n?)*$" ),
              replace = new RegExp("^" + indent_re + "{" + depth + "}", "gm"),
              ret = [];

          while ( blocks.length > 0 ) {
            if ( re.exec( blocks[0] ) ) {
              var b = blocks.shift(),
                  // Now remove that indent
                  x = b.replace( replace, "");

              ret.push( mk_block( x, b.trailing, b.lineNumber ) );
            }
            else
              break;
          }
          return ret;
        }

        // passed to stack.forEach to turn list items up the stack into paras
        function paragraphify(s, i, stack) {
          var list = s.list;
          var last_li = list[list.length-1];

          if ( last_li[1] instanceof Array && last_li[1][0] === "para" )
            return;

          if ( i + 1 === stack.length ) {
            // Last stack frame
            // Keep the same array, but replace the contents
            last_li.push( ["para"].concat( last_li.splice(1, last_li.length - 1) ) );
          }
          else {
            var sublist = last_li.pop();
            last_li.push( ["para"].concat( last_li.splice(1, last_li.length - 1) ), sublist );
          }
        }

        // The matcher function
        return function( block, next ) {
          var m = block.match( is_list_re );
          if ( !m )
            return undefined;

          function make_list( m ) {
            var list = bullet_list.exec( m[2] )
                     ? ["bulletlist"]
                     : ["numberlist"];

            stack.push( { list: list, indent: m[1] } );
            return list;
          }

          var stack = [], // Stack of lists for nesting.
              list = make_list( m ),
              last_li,
              loose = false,
              ret = [ stack[0].list ],
              i;

          // Loop to search over block looking for inner block elements and loose lists
          loose_search:
          while ( true ) {
            // Split into lines preserving new lines at end of line
            var lines = block.split( /(?=\n)/ );

            // We have to grab all lines for a li and call processInline on them
            // once as there are some inline things that can span lines.
            var li_accumulate = "", nl = "";

            // Loop over the lines in this block looking for tight lists.
            tight_search:
            for ( var line_no = 0; line_no < lines.length; line_no++ ) {
              nl = "";
              var l = lines[line_no].replace(/^\n/, function(n) { nl = n; return ""; });

              // TODO: really should cache this
              var line_re = regex_for_depth( stack.length );

              m = l.match( line_re );
              //print( "line:", uneval(l), "\nline match:", uneval(m) );

              // We have a list item
              if ( m[1] !== undefined ) {
                // Process the previous list item, if any
                if ( li_accumulate.length ) {
                  add( last_li, loose, this.processInline( li_accumulate ), nl );
                  // Loose mode will have been dealt with. Reset it
                  loose = false;
                  li_accumulate = "";
                }

                m[1] = expand_tab( m[1] );
                var wanted_depth = Math.floor(m[1].length/4)+1;
                //print( "want:", wanted_depth, "stack:", stack.length);
                if ( wanted_depth > stack.length ) {
                  // Deep enough for a nested list outright
                  //print ( "new nested list" );
                  list = make_list( m );
                  last_li.push( list );
                  last_li = list[1] = [ "listitem" ];
                }
                else {
                  // We aren't deep enough to be strictly a new level. This is
                  // where Md.pl goes nuts. If the indent matches a level in the
                  // stack, put it there, else put it one deeper then the
                  // wanted_depth deserves.
                  var found = false;
                  for ( i = 0; i < stack.length; i++ ) {
                    if ( stack[ i ].indent !== m[1] )
                      continue;

                    list = stack[ i ].list;
                    stack.splice( i+1, stack.length - (i+1) );
                    found = true;
                    break;
                  }

                  if (!found) {
                    //print("not found. l:", uneval(l));
                    wanted_depth++;
                    if ( wanted_depth <= stack.length ) {
                      stack.splice(wanted_depth, stack.length - wanted_depth);
                      //print("Desired depth now", wanted_depth, "stack:", stack.length);
                      list = stack[wanted_depth-1].list;
                      //print("list:", uneval(list) );
                    }
                    else {
                      //print ("made new stack for messy indent");
                      list = make_list(m);
                      last_li.push(list);
                    }
                  }

                  //print( uneval(list), "last", list === stack[stack.length-1].list );
                  last_li = [ "listitem" ];
                  list.push(last_li);
                } // end depth of shenegains
                nl = "";
              }

              // Add content
              if ( l.length > m[0].length )
                li_accumulate += nl + l.substr( m[0].length );
            } // tight_search

            if ( li_accumulate.length ) {
              
              var contents = this.processBlock(li_accumulate, []),
                  firstBlock = contents[0];

              firstBlock.shift();
              contents.splice.apply(contents, [0, 1].concat(firstBlock));
              add( last_li, loose, contents, nl );

              // Let's not creating a trailing \n after content in the li
              if(last_li[last_li.length-1] === "\n") {
                last_li.pop();
              }

              // Loose mode will have been dealt with. Reset it
              loose = false;
              li_accumulate = "";
            }

            // Look at the next block - we might have a loose list. Or an extra
            // paragraph for the current li
            var contained = get_contained_blocks( stack.length, next );

            // Deal with code blocks or properly nested lists
            if ( contained.length > 0 ) {
              // Make sure all listitems up the stack are paragraphs
              forEach( stack, paragraphify, this);

              last_li.push.apply( last_li, this.toTree( contained, [] ) );
            }

            var next_block = next[0] && next[0].valueOf() || "";

            if ( next_block.match(is_list_re) || next_block.match( /^ / ) ) {
              block = next.shift();

              // Check for an HR following a list: features/lists/hr_abutting
              var hr = this.dialect.block.horizRule( block, next );

              if ( hr ) {
                ret.push.apply(ret, hr);
                break;
              }

              // Add paragraphs if the indentation level stays the same
              if (stack[stack.length-1].indent === block.match(/^\s*/)[0]) {
                forEach( stack, paragraphify, this);
              }

              loose = true;
              continue loose_search;
            }
            break;
          } // loose_search

          return ret;
        };
      })(),

      blockquote: function blockquote( block, next ) {

        // Handle quotes that have spaces before them
        var m = /(^|\n) +(\>[\s\S]*)/.exec(block);
        if (m && m[2] && m[2].length) {
          var blockContents = block.replace(/(^|\n) +\>/, "$1>");
          next.unshift(blockContents);
          return [];
        }

        if ( !block.match( /^>/m ) )
          return undefined;

        var jsonml = [];

        // separate out the leading abutting block, if any. I.e. in this case:
        //
        //  a
        //  > b
        //
        if ( block[ 0 ] !== ">" ) {
          var lines = block.split( /\n/ ),
              prev = [],
              line_no = block.lineNumber;

          // keep shifting lines until you find a crotchet
          while ( lines.length && lines[ 0 ][ 0 ] !== ">" ) {
            prev.push( lines.shift() );
            line_no++;
          }

          var abutting = mk_block( prev.join( "\n" ), "\n", block.lineNumber );
          jsonml.push.apply( jsonml, this.processBlock( abutting, [] ) );
          // reassemble new block of just block quotes!
          block = mk_block( lines.join( "\n" ), block.trailing, line_no );
        }

        // if the next block is also a blockquote merge it in
        while ( next.length && next[ 0 ][ 0 ] === ">" ) {
          var b = next.shift();
          block = mk_block( block + block.trailing + b, b.trailing, block.lineNumber );
        }

        // Strip off the leading "> " and re-process as a block.
        var input = block.replace( /^> ?/gm, "" ),
            old_tree = this.tree,
            processedBlock = this.toTree( input, [ "blockquote" ] ),
            attr = extract_attr( processedBlock );

        // If any link references were found get rid of them
        if ( attr && attr.references ) {
          delete attr.references;
          // And then remove the attribute object if it's empty
          if ( isEmpty( attr ) )
            processedBlock.splice( 1, 1 );
        }

        jsonml.push( processedBlock );
        return jsonml;
      },

      referenceDefn: function referenceDefn( block, next) {
        var re = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*)\3|\((.*?)\)))?\n?/;
        // interesting matches are [ , ref_id, url, , title, title ]

        if ( !block.match(re) )
          return undefined;

        var attrs = create_attrs.call( this );

        var b = this.loop_re_over_block(re, block, function( m ) {
          create_reference(attrs, m);
        } );

        if ( b.length )
          next.unshift( mk_block( b, block.trailing ) );

        return [];
      },

      para: function para( block ) {
        // everything's a para!
        return [ ["para"].concat( this.processInline( block ) ) ];
      }
    },

    inline: {

      __oneElement__: function oneElement( text, patterns_or_re, previous_nodes ) {
        var m,
            res;

        patterns_or_re = patterns_or_re || this.dialect.inline.__patterns__;
        var re = new RegExp( "([\\s\\S]*?)(" + (patterns_or_re.source || patterns_or_re) + ")" );

        m = re.exec( text );
        if (!m) {
          // Just boring text
          return [ text.length, text ];
        }
        else if ( m[1] ) {
          // Some un-interesting text matched. Return that first
          return [ m[1].length, m[1] ];
        }

        var res;
        if ( m[2] in this.dialect.inline ) {
          res = this.dialect.inline[ m[2] ].call(
                    this,
                    text.substr( m.index ), m, previous_nodes || [] );
        }
        // Default for now to make dev easier. just slurp special and output it.
        res = res || [ m[2].length, m[2] ];
        return res;
      },

      __call__: function inline( text, patterns ) {

        var out = [],
            res;

        function add(x) {
          //D:self.debug("  adding output", uneval(x));
          if ( typeof x === "string" && typeof out[out.length-1] === "string" )
            out[ out.length-1 ] += x;
          else
            out.push(x);
        }

        while ( text.length > 0 ) {
          res = this.dialect.inline.__oneElement__.call(this, text, patterns, out );
          text = text.substr( res.shift() );
          forEach(res, add );
        }

        return out;
      },

      // These characters are intersting elsewhere, so have rules for them so that
      // chunks of plain text blocks don't include them
      "]": function () {},
      "}": function () {},

      __escape__ : /^\\[\\`\*_{}<>\[\]()#\+.!\-]/,

      "\\": function escaped( text ) {
        // [ length of input processed, node/children to add... ]
        // Only esacape: \ ` * _ { } [ ] ( ) # * + - . !
        if ( this.dialect.inline.__escape__.exec( text ) )
          return [ 2, text.charAt( 1 ) ];
        else
          // Not an esacpe
          return [ 1, "\\" ];
      },

      "![": function image( text ) {

        // Without this guard V8 crashes hard on the RegExp
        if (text.indexOf('(') >= 0 && text.indexOf(')') === -1) { return; }

        // Unlike images, alt text is plain text only. no other elements are
        // allowed in there

        // ![Alt text](/path/to/img.jpg "Optional title")
        //      1          2            3       4         <--- captures
        //
        // First attempt to use a strong URL regexp to catch things like parentheses. If it misses, use the
        // old one.
        var m = text.match( /^!\[(.*?)][ \t]*\(((?:https?:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.])(?:[^\s()<>]+|\([^\s()<>]+\))+(?:\([^\s()<>]+\)|[^`!()\[\]{};:'".,<>?«»“”‘’\s]))\)([ \t])*(["'].*["'])?/ ) ||
                text.match( /^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/ );

        if ( m ) {
          if ( m[2] && m[2][0] === "<" && m[2][m[2].length-1] === ">" )
            m[2] = m[2].substring( 1, m[2].length - 1 );

          m[2] = this.dialect.inline.__call__.call( this, m[2], /\\/ )[0];

          var attrs = { alt: m[1], href: m[2] || "" };
          if ( m[4] !== undefined)
            attrs.title = m[4];

          return [ m[0].length, [ "img", attrs ] ];
        }

        // ![Alt text][id]
        m = text.match( /^!\[(.*?)\][ \t]*\[(.*?)\]/ );

        if ( m ) {
          // We can't check if the reference is known here as it likely wont be
          // found till after. Check it in md tree->hmtl tree conversion
          return [ m[0].length, [ "img_ref", { alt: m[1], ref: m[2].toLowerCase(), original: m[0] } ] ];
        }

        // Just consume the '!['
        return [ 2, "![" ];
      },

      "[": function link( text ) {

        var open = 1;
        for (var i=0; i<text.length; i++) {
          var c = text.charAt(i);
          if (c === '[') { open++; }
          if (c === ']') { open--; }

          if (open > 3) { return [1, "["]; }
        }

        var orig = String(text);
        // Inline content is possible inside `link text`
        var res = inline_until_char.call( this, text.substr(1), "]" );

        // No closing ']' found. Just consume the [
        if ( !res[1] ) {
          var size = res[0] + 1;
          return [ size, text.charAt(0) + res[2].join('') ];
        }

        var consumed = 1 + res[ 0 ],
            children = res[ 1 ],
            link,
            attrs;

        // At this point the first [...] has been parsed. See what follows to find
        // out which kind of link we are (reference or direct url)
        text = text.substr( consumed );

        // [link text](/path/to/img.jpg "Optional title")
        //                 1            2       3         <--- captures
        // This will capture up to the last paren in the block. We then pull
        // back based on if there a matching ones in the url
        //    ([here](/url/(test))
        // The parens have to be balanced
        var m = text.match( /^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/ );
        if ( m ) {
          var url = m[1].replace(/\s+$/, '');
          consumed += m[0].length;

          if ( url && url[0] === "<" && url[url.length-1] === ">" )
            url = url.substring( 1, url.length - 1 );

          // If there is a title we don't have to worry about parens in the url
          if ( !m[3] ) {
            var open_parens = 1; // One open that isn't in the capture
            for ( var len = 0; len < url.length; len++ ) {
              switch ( url[len] ) {
              case "(":
                open_parens++;
                break;
              case ")":
                if ( --open_parens === 0) {
                  consumed -= url.length - len;
                  url = url.substring(0, len);
                }
                break;
              }
            }
          }

          // Process escapes only
          url = this.dialect.inline.__call__.call( this, url, /\\/ )[0];

          attrs = { href: url || "" };
          if ( m[3] !== undefined)
            attrs.title = m[3];

          link = [ "link", attrs ].concat( children );
          return [ consumed, link ];
        }

        // [Alt text][id]
        // [Alt text] [id]
        m = text.match( /^\s*\[(.*?)\]/ );

        if ( m ) {

          consumed += m[ 0 ].length;

          // [links][] uses links as its reference
          attrs = { ref: ( m[ 1 ] || String(children) ).toLowerCase(),  original: orig.substr( 0, consumed ) };

          link = [ "link_ref", attrs ].concat( children );

          // We can't check if the reference is known here as it likely wont be
          // found till after. Check it in md tree->hmtl tree conversion.
          // Store the original so that conversion can revert if the ref isn't found.
          return [ consumed, link ];
        }

        // Another check for references
        m = orig.match(/^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/);
        if (m) {
          var attrs = create_attrs.call(this);
          create_reference(attrs, m);
          return [ m[0].length ];
        }

        // [id]
        // Only if id is plain (no formatting.)
        if ( children.length === 1 && typeof children[0] === "string" ) {

          var normalized = children[0].toLowerCase().replace(/\s+/, ' ');
          attrs = { ref: normalized,  original: orig.substr( 0, consumed ) };
          link = [ "link_ref", attrs, children[0] ];
          return [ consumed, link ];
        }

        // Just consume the "["
        return [ 1, "[" ];
      },

      "<": function autoLink( text ) {
        var m;

        if ( ( m = text.match( /^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/ ) ) !== null ) {
          if ( m[3] )
            return [ m[0].length, [ "link", { href: "mailto:" + m[3] }, m[3] ] ];
          else if ( m[2] === "mailto" )
            return [ m[0].length, [ "link", { href: m[1] }, m[1].substr("mailto:".length ) ] ];
          else
            return [ m[0].length, [ "link", { href: m[1] }, m[1] ] ];
        }

        return [ 1, "<" ];
      },

      "`": function inlineCode( text ) {
        // Inline code block. as many backticks as you like to start it
        // Always skip over the opening ticks.
        var m = text.match( /(`+)(([\s\S]*?)\1)/ );

        if ( m && m[2] )
          return [ m[1].length + m[2].length, [ "inlinecode", m[3] ] ];
        else {
          // TODO: No matching end code found - warn!
          return [ 1, "`" ];
        }
      },

      "  \n": function lineBreak() {
        return [ 3, [ "linebreak" ] ];
      }

    }
  };

  // Meta Helper/generator method for em and strong handling
  function strong_em( tag, md ) {

    var state_slot = tag + "_state",
        other_slot = tag === "strong" ? "em_state" : "strong_state";

    function CloseTag(len) {
      this.len_after = len;
      this.name = "close_" + md;
    }

    return function ( text ) {

      if ( this[state_slot][0] === md ) {
        // Most recent em is of this type
        //D:this.debug("closing", md);
        this[state_slot].shift();

        // "Consume" everything to go back to the recrusion in the else-block below
        return[ text.length, new CloseTag(text.length-md.length) ];
      }
      else {
        // Store a clone of the em/strong states
        var other = this[other_slot].slice(),
            state = this[state_slot].slice();

        this[state_slot].unshift(md);

        //D:this.debug_indent += "  ";

        // Recurse
        var res = this.processInline( text.substr( md.length ) );
        //D:this.debug_indent = this.debug_indent.substr(2);

        var last = res[res.length - 1];

        //D:this.debug("processInline from", tag + ": ", uneval( res ) );

        var check = this[state_slot].shift();
        if ( last instanceof CloseTag ) {
          res.pop();
          // We matched! Huzzah.
          var consumed = text.length - last.len_after;
          return [ consumed, [ tag ].concat(res) ];
        }
        else {
          // Restore the state of the other kind. We might have mistakenly closed it.
          this[other_slot] = other;
          this[state_slot] = state;

          // We can't reuse the processed result as it could have wrong parsing contexts in it.
          return [ md.length, md ];
        }
      }
    }; // End returned function
  }

  // A helper function to create attributes
  function create_attrs() {
    if ( !extract_attr( this.tree ) ) {
      this.tree.splice( 1, 0, {} );
    }

    var attrs = extract_attr( this.tree );

    // make a references hash if it doesn't exist
    if ( attrs.references === undefined ) {
      attrs.references = {};
    }

    return attrs;
  }

  // Create references for attributes
  function create_reference(attrs, m) {
    if ( m[2] && m[2][0] === "<" && m[2][m[2].length-1] === ">" )
      m[2] = m[2].substring( 1, m[2].length - 1 );

    var ref = attrs.references[ m[1].toLowerCase() ] = {
      href: m[2]
    };

    if ( m[4] !== undefined )
      ref.title = m[4];
    else if ( m[5] !== undefined )
      ref.title = m[5];
  }

  Gruber.inline["**"] = strong_em("strong", "**");
  Gruber.inline["__"] = strong_em("strong", "__");
  Gruber.inline["*"]  = strong_em("em", "*");
  Gruber.inline["_"]  = strong_em("em", "_");

  Markdown.dialects.Gruber = Gruber;
  Markdown.buildBlockOrder ( Markdown.dialects.Gruber.block );
  Markdown.buildInlinePatterns( Markdown.dialects.Gruber.inline );

  var Maruku = DialectHelpers.subclassDialect( Gruber ),
      extract_attr = MarkdownHelpers.extract_attr,
      forEach = MarkdownHelpers.forEach;

  Maruku.processMetaHash = function processMetaHash( meta_string ) {
    var meta = split_meta_hash( meta_string ),
        attr = {};

    for ( var i = 0; i < meta.length; ++i ) {
      // id: #foo
      if ( /^#/.test( meta[ i ] ) )
        attr.id = meta[ i ].substring( 1 );
      // class: .foo
      else if ( /^\./.test( meta[ i ] ) ) {
        // if class already exists, append the new one
        if ( attr["class"] )
          attr["class"] = attr["class"] + meta[ i ].replace( /./, " " );
        else
          attr["class"] = meta[ i ].substring( 1 );
      }
      // attribute: foo=bar
      else if ( /\=/.test( meta[ i ] ) ) {
        var s = meta[ i ].split( /\=/ );
        attr[ s[ 0 ] ] = s[ 1 ];
      }
    }

    return attr;
  };

  function split_meta_hash( meta_string ) {
    var meta = meta_string.split( "" ),
        parts = [ "" ],
        in_quotes = false;

    while ( meta.length ) {
      var letter = meta.shift();
      switch ( letter ) {
      case " " :
        // if we're in a quoted section, keep it
        if ( in_quotes )
          parts[ parts.length - 1 ] += letter;
        // otherwise make a new part
        else
          parts.push( "" );
        break;
      case "'" :
      case '"' :
        // reverse the quotes and move straight on
        in_quotes = !in_quotes;
        break;
      case "\\" :
        // shift off the next letter to be used straight away.
        // it was escaped so we'll keep it whatever it is
        letter = meta.shift();
        /* falls through */
      default :
        parts[ parts.length - 1 ] += letter;
        break;
      }
    }

    return parts;
  }

  Maruku.block.document_meta = function document_meta( block ) {
    // we're only interested in the first block
    if ( block.lineNumber > 1 )
      return undefined;

    // document_meta blocks consist of one or more lines of `Key: Value\n`
    if ( ! block.match( /^(?:\w+:.*\n)*\w+:.*$/ ) )
      return undefined;

    // make an attribute node if it doesn't exist
    if ( !extract_attr( this.tree ) )
      this.tree.splice( 1, 0, {} );

    var pairs = block.split( /\n/ );
    for ( var p in pairs ) {
      var m = pairs[ p ].match( /(\w+):\s*(.*)$/ ),
          key = m[ 1 ].toLowerCase(),
          value = m[ 2 ];

      this.tree[ 1 ][ key ] = value;
    }

    // document_meta produces no content!
    return [];
  };

  Maruku.block.block_meta = function block_meta( block ) {
    // check if the last line of the block is an meta hash
    var m = block.match( /(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/ );
    if ( !m )
      return undefined;

    // process the meta hash
    var attr = this.dialect.processMetaHash( m[ 2 ] ),
        hash;

    // if we matched ^ then we need to apply meta to the previous block
    if ( m[ 1 ] === "" ) {
      var node = this.tree[ this.tree.length - 1 ];
      hash = extract_attr( node );

      // if the node is a string (rather than JsonML), bail
      if ( typeof node === "string" )
        return undefined;

      // create the attribute hash if it doesn't exist
      if ( !hash ) {
        hash = {};
        node.splice( 1, 0, hash );
      }

      // add the attributes in
      for ( var a in attr )
        hash[ a ] = attr[ a ];

      // return nothing so the meta hash is removed
      return [];
    }

    // pull the meta hash off the block and process what's left
    var b = block.replace( /\n.*$/, "" ),
        result = this.processBlock( b, [] );

    // get or make the attributes hash
    hash = extract_attr( result[ 0 ] );
    if ( !hash ) {
      hash = {};
      result[ 0 ].splice( 1, 0, hash );
    }

    // attach the attributes to the block
    for ( var a in attr )
      hash[ a ] = attr[ a ];

    return result;
  };

  Maruku.block.definition_list = function definition_list( block, next ) {
    // one or more terms followed by one or more definitions, in a single block
    var tight = /^((?:[^\s:].*\n)+):\s+([\s\S]+)$/,
        list = [ "dl" ],
        i, m;

    // see if we're dealing with a tight or loose block
    if ( ( m = block.match( tight ) ) ) {
      // pull subsequent tight DL blocks out of `next`
      var blocks = [ block ];
      while ( next.length && tight.exec( next[ 0 ] ) )
        blocks.push( next.shift() );

      for ( var b = 0; b < blocks.length; ++b ) {
        var m = blocks[ b ].match( tight ),
            terms = m[ 1 ].replace( /\n$/, "" ).split( /\n/ ),
            defns = m[ 2 ].split( /\n:\s+/ );

        // print( uneval( m ) );

        for ( i = 0; i < terms.length; ++i )
          list.push( [ "dt", terms[ i ] ] );

        for ( i = 0; i < defns.length; ++i ) {
          // run inline processing over the definition
          list.push( [ "dd" ].concat( this.processInline( defns[ i ].replace( /(\n)\s+/, "$1" ) ) ) );
        }
      }
    }
    else {
      return undefined;
    }

    return [ list ];
  };

  // splits on unescaped instances of @ch. If @ch is not a character the result
  // can be unpredictable

  Maruku.block.table = function table ( block ) {

    var _split_on_unescaped = function( s, ch ) {
      ch = ch || '\\s';
      if ( ch.match(/^[\\|\[\]{}?*.+^$]$/) )
        ch = '\\' + ch;
      var res = [ ],
          r = new RegExp('^((?:\\\\.|[^\\\\' + ch + '])*)' + ch + '(.*)'),
          m;
      while ( ( m = s.match( r ) ) ) {
        res.push( m[1] );
        s = m[2];
      }
      res.push(s);
      return res;
    };

    var leading_pipe = /^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/,
        // find at least an unescaped pipe in each line
        no_leading_pipe = /^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/,
        i,
        m;
    if ( ( m = block.match( leading_pipe ) ) ) {
      // remove leading pipes in contents
      // (header and horizontal rule already have the leading pipe left out)
      m[3] = m[3].replace(/^\s*\|/gm, '');
    } else if ( ! ( m = block.match( no_leading_pipe ) ) ) {
      return undefined;
    }

    var table = [ "table", [ "thead", [ "tr" ] ], [ "tbody" ] ];

    // remove trailing pipes, then split on pipes
    // (no escaped pipes are allowed in horizontal rule)
    m[2] = m[2].replace(/\|\s*$/, '').split('|');

    // process alignment
    var html_attrs = [ ];
    forEach (m[2], function (s) {
      if (s.match(/^\s*-+:\s*$/))
        html_attrs.push({align: "right"});
      else if (s.match(/^\s*:-+\s*$/))
        html_attrs.push({align: "left"});
      else if (s.match(/^\s*:-+:\s*$/))
        html_attrs.push({align: "center"});
      else
        html_attrs.push({});
    });

    // now for the header, avoid escaped pipes
    m[1] = _split_on_unescaped(m[1].replace(/\|\s*$/, ''), '|');
    for (i = 0; i < m[1].length; i++) {
      table[1][1].push(['th', html_attrs[i] || {}].concat(
        this.processInline(m[1][i].trim())));
    }

    // now for body contents
    forEach (m[3].replace(/\|\s*$/mg, '').split('\n'), function (row) {
      var html_row = ['tr'];
      row = _split_on_unescaped(row, '|');
      for (i = 0; i < row.length; i++)
        html_row.push(['td', html_attrs[i] || {}].concat(this.processInline(row[i].trim())));
      table[2].push(html_row);
    }, this);

    return [table];
  };

  Maruku.inline[ "{:" ] = function inline_meta( text, matches, out ) {
    if ( !out.length )
      return [ 2, "{:" ];

    // get the preceeding element
    var before = out[ out.length - 1 ];

    if ( typeof before === "string" )
      return [ 2, "{:" ];

    // match a meta hash
    var m = text.match( /^\{:\s*((?:\\\}|[^\}])*)\s*\}/ );

    // no match, false alarm
    if ( !m )
      return [ 2, "{:" ];

    // attach the attributes to the preceeding element
    var meta = this.dialect.processMetaHash( m[ 1 ] ),
        attr = extract_attr( before );

    if ( !attr ) {
      attr = {};
      before.splice( 1, 0, attr );
    }

    for ( var k in meta )
      attr[ k ] = meta[ k ];

    // cut out the string and replace it with nothing
    return [ m[ 0 ].length, "" ];
  };

  Markdown.dialects.Maruku = Maruku;
  Markdown.dialects.Maruku.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/;
  Markdown.buildBlockOrder ( Markdown.dialects.Maruku.block );
  Markdown.buildInlinePatterns( Markdown.dialects.Maruku.inline );

// Include all our dependencies and return the resulting library.

  expose.Markdown = Markdown;
  expose.parse = Markdown.parse;
  expose.toHTML = Markdown.toHTML;
  expose.toHTMLTree = Markdown.toHTMLTree;
  expose.renderJsonML = Markdown.renderJsonML;
  expose.DialectHelpers = DialectHelpers;

})(function() {
  window.markdown = {};
  return window.markdown;
}());

/* js-yaml 3.0.1 https://github.com/nodeca/js-yaml */!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.jsyaml=e():"undefined"!=typeof global?global.jsyaml=e():"undefined"!=typeof self&&(self.jsyaml=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


var yaml = require('./lib/js-yaml.js');


module.exports = yaml;

},{"./lib/js-yaml.js":2}],2:[function(require,module,exports){
'use strict';


var loader = require('./js-yaml/loader');
var dumper = require('./js-yaml/dumper');


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


module.exports.Type                = require('./js-yaml/type');
module.exports.Schema              = require('./js-yaml/schema');
module.exports.FAILSAFE_SCHEMA     = require('./js-yaml/schema/failsafe');
module.exports.JSON_SCHEMA         = require('./js-yaml/schema/json');
module.exports.CORE_SCHEMA         = require('./js-yaml/schema/core');
module.exports.DEFAULT_SAFE_SCHEMA = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_FULL_SCHEMA = require('./js-yaml/schema/default_full');
module.exports.load                = loader.load;
module.exports.loadAll             = loader.loadAll;
module.exports.safeLoad            = loader.safeLoad;
module.exports.safeLoadAll         = loader.safeLoadAll;
module.exports.dump                = dumper.dump;
module.exports.safeDump            = dumper.safeDump;
module.exports.YAMLException       = require('./js-yaml/exception');

// Deprecared schema names from JS-YAML 2.0.x
module.exports.MINIMAL_SCHEMA = require('./js-yaml/schema/failsafe');
module.exports.SAFE_SCHEMA    = require('./js-yaml/schema/default_safe');
module.exports.DEFAULT_SCHEMA = require('./js-yaml/schema/default_full');

// Deprecated functions from JS-YAML 1.x.x
module.exports.scan           = deprecated('scan');
module.exports.parse          = deprecated('parse');
module.exports.compose        = deprecated('compose');
module.exports.addConstructor = deprecated('addConstructor');

},{"./js-yaml/dumper":4,"./js-yaml/exception":5,"./js-yaml/loader":6,"./js-yaml/schema":8,"./js-yaml/schema/core":9,"./js-yaml/schema/default_full":10,"./js-yaml/schema/default_safe":11,"./js-yaml/schema/failsafe":12,"./js-yaml/schema/json":13,"./js-yaml/type":14}],3:[function(require,module,exports){
'use strict';


function isNothing(subject) {
  return (undefined === subject) || (null === subject);
}


function isObject(subject) {
  return ('object' === typeof subject) && (null !== subject);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) {
    return sequence;
  } else if (isNothing(sequence)) {
    return [];
  } else {
    return [ sequence ];
  }
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


module.exports.isNothing  = isNothing;
module.exports.isObject   = isObject;
module.exports.toArray    = toArray;
module.exports.repeat     = repeat;
module.exports.extend     = extend;

},{}],4:[function(require,module,exports){
'use strict';


var common              = require('./common');
var YAMLException       = require('./exception');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');


var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */


var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';


var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];


function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (null === map) {
    return {};
  }

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if ('!!' === tag.slice(0, 2)) {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }

    type = schema.compiledTypeMap[tag];

    if (type && _hasOwnProperty.call(type.dumpStyleAliases, style)) {
      style = type.dumpStyleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}


function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


function State(options) {
  this.schema      = options['schema'] || DEFAULT_FULL_SCHEMA;
  this.indent      = Math.max(1, (options['indent'] || 2));
  this.skipInvalid = options['skipInvalid'] || false;
  this.flowLevel   = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap    = compileStyleMap(this.schema, options['styles'] || null);

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';
}


function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.loadResolver && type.loadResolver({ result: str })) {
      return true;
    }
  }

  return false;
}

function writeScalar(state, object) {
  var isQuoted, checkpoint, position, length, character, first;

  state.dump = '';
  isQuoted = false;
  checkpoint = 0;
  first = object.charCodeAt(0) || 0;

  if (-1 !== DEPRECATED_BOOLEANS_SYNTAX.indexOf(object)) {
    // Ensure compatibility with YAML 1.0/1.1 loaders.
    isQuoted = true;
  } else if (0 === object.length) {
    // Quote empty string
    isQuoted = true;
  } else if (CHAR_SPACE    === first ||
             CHAR_SPACE    === object.charCodeAt(object.length - 1)) {
    isQuoted = true;
  } else if (CHAR_MINUS    === first ||
             CHAR_QUESTION === first) {
    // Don't check second symbol for simplicity
    isQuoted = true;
  }

  for (position = 0, length = object.length; position < length; position += 1) {
    character = object.charCodeAt(position);

    if (!isQuoted) {
      if (CHAR_TAB                  === character ||
          CHAR_LINE_FEED            === character ||
          CHAR_CARRIAGE_RETURN      === character ||
          CHAR_COMMA                === character ||
          CHAR_LEFT_SQUARE_BRACKET  === character ||
          CHAR_RIGHT_SQUARE_BRACKET === character ||
          CHAR_LEFT_CURLY_BRACKET   === character ||
          CHAR_RIGHT_CURLY_BRACKET  === character ||
          CHAR_SHARP                === character ||
          CHAR_AMPERSAND            === character ||
          CHAR_ASTERISK             === character ||
          CHAR_EXCLAMATION          === character ||
          CHAR_VERTICAL_LINE        === character ||
          CHAR_GREATER_THAN         === character ||
          CHAR_SINGLE_QUOTE         === character ||
          CHAR_DOUBLE_QUOTE         === character ||
          CHAR_PERCENT              === character ||
          CHAR_COMMERCIAL_AT        === character ||
          CHAR_COLON                === character ||
          CHAR_GRAVE_ACCENT         === character) {
        isQuoted = true;
      }
    }

    if (ESCAPE_SEQUENCES[character] ||
        !((0x00020 <= character && character <= 0x00007E) ||
          (0x00085 === character)                         ||
          (0x000A0 <= character && character <= 0x00D7FF) ||
          (0x0E000 <= character && character <= 0x00FFFD) ||
          (0x10000 <= character && character <= 0x10FFFF))) {
      state.dump += object.slice(checkpoint, position);
      state.dump += ESCAPE_SEQUENCES[character] || encodeHex(character);
      checkpoint = position + 1;
      isQuoted = true;
    }
  }

  if (checkpoint < position) {
    state.dump += object.slice(checkpoint, position);
  }

  if (!isQuoted && testImplicitResolving(state, state.dump)) {
    isQuoted = true;
  }

  if (isQuoted) {
    state.dump = '"' + state.dump + '"';
  }
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (0 !== index) {
        _result += ', ';
      }
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || 0 !== index) {
        _result += generateNextLine(state, level);
      }
      _result += '- ' + state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (0 !== index) {
      pairBuffer += ', ';
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) {
      pairBuffer += '? ';
    }

    pairBuffer += state.dump + ': ';

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || 0 !== index) {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level + 1, objectKey, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (null !== state.tag && '?' !== state.tag) ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.dumpInstanceOf  || type.dumpPredicate) &&
        (!type.dumpInstanceOf || (('object' === typeof object) && (object instanceof type.dumpInstanceOf))) &&
        (!type.dumpPredicate  || type.dumpPredicate(object))) {

      state.tag = explicit ? type.tag : '?';

      if (type.dumpRepresenter) {
        style = state.styleMap[type.tag] || type.dumpDefaultStyle;

        if ('[object Function]' === _toString.call(type.dumpRepresenter)) {
          _result = type.dumpRepresenter(object, style);
        } else if (_hasOwnProperty.call(type.dumpRepresenter, style)) {
          _result = type.dumpRepresenter[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  if (block) {
    block = (0 > state.flowLevel || state.flowLevel > level);
  }

  if ((null !== state.tag && '?' !== state.tag) || (2 !== state.indent && level > 0)) {
    compact = false;
  }

  if ('[object Object]' === type) {
    if (block && (0 !== Object.keys(state.dump).length)) {
      writeBlockMapping(state, level, state.dump, compact);
    } else {
      writeFlowMapping(state, level, state.dump);
    }
  } else if ('[object Array]' === type) {
    if (block && (0 !== state.dump.length)) {
      writeBlockSequence(state, level, state.dump, compact);
    } else {
      writeFlowSequence(state, level, state.dump);
    }
  } else if ('[object String]' === type) {
    if ('?' !== state.tag) {
      writeScalar(state, state.dump);
    }
  } else if (state.skipInvalid) {
    return false;
  } else {
    throw new YAMLException('unacceptabe kind of an object to dump ' + type);
  }

  if (null !== state.tag && '?' !== state.tag) {
    state.dump = '!<' + state.tag + '> ' + state.dump;
  }
  return true;
}


function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (writeNode(state, 0, input, true, true)) {
    return state.dump + '\n';
  } else {
    return '';
  }
}


function safeDump(input, options) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.dump     = dump;
module.exports.safeDump = safeDump;

},{"./common":3,"./exception":5,"./schema/default_full":10,"./schema/default_safe":11}],5:[function(require,module,exports){
'use strict';


function YAMLException(reason, mark) {
  this.name    = 'YAMLException';
  this.reason  = reason;
  this.mark    = mark;
  this.message = this.toString(false);
}


YAMLException.prototype.toString = function toString(compact) {
  var result;

  result = 'JS-YAML: ' + (this.reason || '(unknown reason)');

  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }

  return result;
};


module.exports = YAMLException;

},{}],6:[function(require,module,exports){
'use strict';


var common              = require('./common');
var YAMLException       = require('./exception');
var Mark                = require('./mark');
var DEFAULT_SAFE_SCHEMA = require('./schema/default_safe');
var DEFAULT_FULL_SCHEMA = require('./schema/default_full');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var CHAR_TAB                  = 0x09;   /* Tab */
var CHAR_LINE_FEED            = 0x0A;   /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D;   /* CR */
var CHAR_SPACE                = 0x20;   /* Space */
var CHAR_EXCLAMATION          = 0x21;   /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22;   /* " */
var CHAR_SHARP                = 0x23;   /* # */
var CHAR_PERCENT              = 0x25;   /* % */
var CHAR_AMPERSAND            = 0x26;   /* & */
var CHAR_SINGLE_QUOTE         = 0x27;   /* ' */
var CHAR_ASTERISK             = 0x2A;   /* * */
var CHAR_PLUS                 = 0x2B;   /* + */
var CHAR_COMMA                = 0x2C;   /* , */
var CHAR_MINUS                = 0x2D;   /* - */
var CHAR_DOT                  = 0x2E;   /* . */
var CHAR_SLASH                = 0x2F;   /* / */
var CHAR_DIGIT_ZERO           = 0x30;   /* 0 */
var CHAR_DIGIT_ONE            = 0x31;   /* 1 */
var CHAR_DIGIT_NINE           = 0x39;   /* 9 */
var CHAR_COLON                = 0x3A;   /* : */
var CHAR_LESS_THAN            = 0x3C;   /* < */
var CHAR_GREATER_THAN         = 0x3E;   /* > */
var CHAR_QUESTION             = 0x3F;   /* ? */
var CHAR_COMMERCIAL_AT        = 0x40;   /* @ */
var CHAR_CAPITAL_A            = 0x41;   /* A */
var CHAR_CAPITAL_F            = 0x46;   /* F */
var CHAR_CAPITAL_L            = 0x4C;   /* L */
var CHAR_CAPITAL_N            = 0x4E;   /* N */
var CHAR_CAPITAL_P            = 0x50;   /* P */
var CHAR_CAPITAL_U            = 0x55;   /* U */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B;   /* [ */
var CHAR_BACKSLASH            = 0x5C;   /* \ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D;   /* ] */
var CHAR_UNDERSCORE           = 0x5F;   /* _ */
var CHAR_GRAVE_ACCENT         = 0x60;   /* ` */
var CHAR_SMALL_A              = 0x61;   /* a */
var CHAR_SMALL_B              = 0x62;   /* b */
var CHAR_SMALL_E              = 0x65;   /* e */
var CHAR_SMALL_F              = 0x66;   /* f */
var CHAR_SMALL_N              = 0x6E;   /* n */
var CHAR_SMALL_R              = 0x72;   /* r */
var CHAR_SMALL_T              = 0x74;   /* t */
var CHAR_SMALL_U              = 0x75;   /* u */
var CHAR_SMALL_V              = 0x76;   /* v */
var CHAR_SMALL_X              = 0x78;   /* x */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B;   /* { */
var CHAR_VERTICAL_LINE        = 0x7C;   /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D;   /* } */


var SIMPLE_ESCAPE_SEQUENCES = {};

SIMPLE_ESCAPE_SEQUENCES[CHAR_DIGIT_ZERO]   = '\x00';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_A]      = '\x07';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_B]      = '\x08';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_T]      = '\x09';
SIMPLE_ESCAPE_SEQUENCES[CHAR_TAB]          = '\x09';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_N]      = '\x0A';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_V]      = '\x0B';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_F]      = '\x0C';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_R]      = '\x0D';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SMALL_E]      = '\x1B';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SPACE]        = ' ';
SIMPLE_ESCAPE_SEQUENCES[CHAR_DOUBLE_QUOTE] = '\x22';
SIMPLE_ESCAPE_SEQUENCES[CHAR_SLASH]        = '/';
SIMPLE_ESCAPE_SEQUENCES[CHAR_BACKSLASH]    = '\x5C';
SIMPLE_ESCAPE_SEQUENCES[CHAR_CAPITAL_N]    = '\x85';
SIMPLE_ESCAPE_SEQUENCES[CHAR_UNDERSCORE]   = '\xA0';
SIMPLE_ESCAPE_SEQUENCES[CHAR_CAPITAL_L]    = '\u2028';
SIMPLE_ESCAPE_SEQUENCES[CHAR_CAPITAL_P]    = '\u2029';


var HEXADECIMAL_ESCAPE_SEQUENCES = {};

HEXADECIMAL_ESCAPE_SEQUENCES[CHAR_SMALL_X]   = 2;
HEXADECIMAL_ESCAPE_SEQUENCES[CHAR_SMALL_U]   = 4;
HEXADECIMAL_ESCAPE_SEQUENCES[CHAR_CAPITAL_U] = 8;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uD800-\uDFFF\uFFFE\uFFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function State(input, options) {
  this.input    = input;

  this.filename = options['filename'] || null;
  this.schema   = options['schema']   || DEFAULT_FULL_SCHEMA;
  this.strict   = options['strict']   || false;
  this.legacy   = options['legacy']   || false;

  this.implicitTypes     = this.schema.compiledImplicit;
  this.typeMap           = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;
  this.character  = input.charCodeAt(0 /*position*/);

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  return new YAMLException(
    message,
    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  var error = generateError(state, message);

  if (state.strict) {
    throw error;
  } else {
    console.warn(error.toString());
  }
}


var directiveHandlers = {

  'YAML': function handleYamlDirective(state, name, args) {

      var match, major, minor;

      if (null !== state.version) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (1 !== args.length) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (null === match) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (1 !== major) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = (minor < 2);

      if (1 !== minor && 2 !== minor) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },

  'TAG': function handleTagDirective(state, name, args) {

      var handle, prefix;

      if (2 !== args.length) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      state.tagMap[handle] = prefix;
    }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length;
           _position < _length;
           _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(0x09 === _character ||
              0x20 <= _character && _character <= 0x10FFFF)) {
          throwError(state, 'expected valid JSON character');
        }
      }
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty.call(destination, key)) {
      destination[key] = source[key];
    }
  }
}

function storeMappingPair(state, _result, keyTag, keyNode, valueNode) {
  var index, quantity;

  keyNode = String(keyNode);

  if (null === _result) {
    _result = {};
  }

  if ('tag:yaml.org,2002:merge' === keyTag) {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index]);
      }
    } else {
      mergeMappings(state, _result, valueNode);
    }
  } else {
    _result[keyNode] = valueNode;
  }

  return _result;
}

function readLineBreak(state) {
  if (CHAR_LINE_FEED === state.character) {
    state.position += 1;
  } else if (CHAR_CARRIAGE_RETURN === state.character) {
    if (CHAR_LINE_FEED === state.input.charCodeAt(state.position + 1)) {
      state.position += 2;
    } else {
      state.position += 1;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.character = state.input.charCodeAt(state.position);
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0;

  while (state.position < state.length) {
    while (CHAR_SPACE === state.character || CHAR_TAB === state.character) {
      state.character = state.input.charCodeAt(++state.position);
    }

    if (allowComments && CHAR_SHARP === state.character) {
      do { state.character = state.input.charCodeAt(++state.position); }
      while (state.position < state.length &&
             CHAR_LINE_FEED !== state.character &&
             CHAR_CARRIAGE_RETURN !== state.character);
    }

    if (CHAR_LINE_FEED === state.character || CHAR_CARRIAGE_RETURN === state.character) {
      readLineBreak(state);
      lineBreaks += 1;
      state.lineIndent = 0;

      while (CHAR_SPACE === state.character) {
        state.lineIndent += 1;
        state.character = state.input.charCodeAt(++state.position);
      }

      if (state.lineIndent < checkIndent) {
        throwWarning(state, 'deficient indentation');
      }
    } else {
      break;
    }
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position, _character;

  if (state.position === state.lineStart &&
      (CHAR_MINUS === state.character || CHAR_DOT === state.character) &&
      state.input.charCodeAt(state.position + 1) === state.character &&
      state.input.charCodeAt(state.position + 2) === state.character) {

    _position = state.position + 3;
    _character = state.input.charCodeAt(_position);

    if (_position >= state.length ||
        CHAR_SPACE           === _character ||
        CHAR_TAB             === _character ||
        CHAR_LINE_FEED       === _character ||
        CHAR_CARRIAGE_RETURN === _character) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (1 === count) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result;

  if (CHAR_SPACE                === state.character ||
      CHAR_TAB                  === state.character ||
      CHAR_LINE_FEED            === state.character ||
      CHAR_CARRIAGE_RETURN      === state.character ||
      CHAR_COMMA                === state.character ||
      CHAR_LEFT_SQUARE_BRACKET  === state.character ||
      CHAR_RIGHT_SQUARE_BRACKET === state.character ||
      CHAR_LEFT_CURLY_BRACKET   === state.character ||
      CHAR_RIGHT_CURLY_BRACKET  === state.character ||
      CHAR_SHARP                === state.character ||
      CHAR_AMPERSAND            === state.character ||
      CHAR_ASTERISK             === state.character ||
      CHAR_EXCLAMATION          === state.character ||
      CHAR_VERTICAL_LINE        === state.character ||
      CHAR_GREATER_THAN         === state.character ||
      CHAR_SINGLE_QUOTE         === state.character ||
      CHAR_DOUBLE_QUOTE         === state.character ||
      CHAR_PERCENT              === state.character ||
      CHAR_COMMERCIAL_AT        === state.character ||
      CHAR_GRAVE_ACCENT         === state.character) {
    return false;
  }

  if (CHAR_QUESTION === state.character ||
      CHAR_MINUS === state.character) {
    following = state.input.charCodeAt(state.position + 1);

    if (CHAR_SPACE                 === following ||
        CHAR_TAB                   === following ||
        CHAR_LINE_FEED             === following ||
        CHAR_CARRIAGE_RETURN       === following ||
        withinFlowCollection &&
        (CHAR_COMMA                === following ||
         CHAR_LEFT_SQUARE_BRACKET  === following ||
         CHAR_RIGHT_SQUARE_BRACKET === following ||
         CHAR_LEFT_CURLY_BRACKET   === following ||
         CHAR_RIGHT_CURLY_BRACKET  === following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (state.position < state.length) {
    if (CHAR_COLON === state.character) {
      following = state.input.charCodeAt(state.position + 1);

      if (CHAR_SPACE                 === following ||
          CHAR_TAB                   === following ||
          CHAR_LINE_FEED             === following ||
          CHAR_CARRIAGE_RETURN       === following ||
          withinFlowCollection &&
          (CHAR_COMMA                === following ||
           CHAR_LEFT_SQUARE_BRACKET  === following ||
           CHAR_RIGHT_SQUARE_BRACKET === following ||
           CHAR_LEFT_CURLY_BRACKET   === following ||
           CHAR_RIGHT_CURLY_BRACKET  === following)) {
        break;
      }

    } else if (CHAR_SHARP === state.character) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (CHAR_SPACE           === preceding ||
          CHAR_TAB             === preceding ||
          CHAR_LINE_FEED       === preceding ||
          CHAR_CARRIAGE_RETURN === preceding) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection &&
               (CHAR_COMMA                === state.character ||
                CHAR_LEFT_SQUARE_BRACKET  === state.character ||
                CHAR_RIGHT_SQUARE_BRACKET === state.character ||
                CHAR_LEFT_CURLY_BRACKET   === state.character ||
                CHAR_RIGHT_CURLY_BRACKET  === state.character)) {
      break;

    } else if (CHAR_LINE_FEED === state.character ||
               CHAR_CARRIAGE_RETURN === state.character) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        state.character = state.input.charCodeAt(state.position);
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (CHAR_SPACE !== state.character && CHAR_TAB !== state.character) {
      captureEnd = state.position + 1;
    }

    state.character = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  } else {
    state.kind = _kind;
    state.result = _result;
    return false;
  }
}

function readSingleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd;

  if (CHAR_SINGLE_QUOTE !== state.character) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.character = state.input.charCodeAt(++state.position);
  captureStart = captureEnd = state.position;

  while (state.position < state.length) {
    if (CHAR_SINGLE_QUOTE === state.character) {
      captureSegment(state, captureStart, state.position, true);
      state.character = state.input.charCodeAt(++state.position);

      if (CHAR_SINGLE_QUOTE === state.character) {
        captureStart = captureEnd = state.position;
        state.character = state.input.charCodeAt(++state.position);
      } else {
        return true;
      }

    } else if (CHAR_LINE_FEED === state.character ||
               CHAR_CARRIAGE_RETURN === state.character) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
      state.character = state.input.charCodeAt(state.position);

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.character = state.input.charCodeAt(++state.position);
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexIndex,
      hexOffset,
      hexResult;

  if (CHAR_DOUBLE_QUOTE !== state.character) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.character = state.input.charCodeAt(++state.position);
  captureStart = captureEnd = state.position;

  while (state.position < state.length) {
    if (CHAR_DOUBLE_QUOTE === state.character) {
      captureSegment(state, captureStart, state.position, true);
      state.character = state.input.charCodeAt(++state.position);
      return true;

    } else if (CHAR_BACKSLASH === state.character) {
      captureSegment(state, captureStart, state.position, true);
      state.character = state.input.charCodeAt(++state.position);

      if (CHAR_LINE_FEED       === state.character ||
          CHAR_CARRIAGE_RETURN === state.character) {
        skipSeparationSpace(state, false, nodeIndent);

      } else if (SIMPLE_ESCAPE_SEQUENCES[state.character]) {
        state.result += SIMPLE_ESCAPE_SEQUENCES[state.character];
        state.character = state.input.charCodeAt(++state.position);

      } else if (HEXADECIMAL_ESCAPE_SEQUENCES[state.character]) {
        hexLength = HEXADECIMAL_ESCAPE_SEQUENCES[state.character];
        hexResult = 0;

        for (hexIndex = 1; hexIndex <= hexLength; hexIndex += 1) {
          hexOffset = (hexLength - hexIndex) * 4;
          state.character = state.input.charCodeAt(++state.position);

          if (CHAR_DIGIT_ZERO <= state.character && state.character <= CHAR_DIGIT_NINE) {
            hexResult |= (state.character - CHAR_DIGIT_ZERO) << hexOffset;

          } else if (CHAR_CAPITAL_A <= state.character && state.character <= CHAR_CAPITAL_F) {
            hexResult |= (state.character - CHAR_CAPITAL_A + 10) << hexOffset;

          } else if (CHAR_SMALL_A <= state.character && state.character <= CHAR_SMALL_F) {
            hexResult |= (state.character - CHAR_SMALL_A + 10) << hexOffset;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += String.fromCharCode(hexResult);
        state.character = state.input.charCodeAt(++state.position);

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (CHAR_LINE_FEED === state.character ||
               CHAR_CARRIAGE_RETURN === state.character) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
      state.character = state.input.charCodeAt(state.position);

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.character = state.input.charCodeAt(++state.position);
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _tag     = state.tag,
      _result,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      keyNode,
      keyTag,
      valueNode;

  switch (state.character) {
  case CHAR_LEFT_SQUARE_BRACKET:
    terminator = CHAR_RIGHT_SQUARE_BRACKET;
    isMapping = false;
    _result = [];
    break;

  case CHAR_LEFT_CURLY_BRACKET:
    terminator = CHAR_RIGHT_CURLY_BRACKET;
    isMapping = true;
    _result = {};
    break;

  default:
    return false;
  }

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  state.character = state.input.charCodeAt(++state.position);

  while (state.position < state.length) {
    skipSeparationSpace(state, true, nodeIndent);

    if (state.character === terminator) {
      state.character = state.input.charCodeAt(++state.position);
      state.tag = _tag;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (CHAR_QUESTION === state.character) {
      following = state.input.charCodeAt(state.position + 1);

      if (CHAR_SPACE === following ||
          CHAR_TAB === following ||
          CHAR_LINE_FEED === following ||
          CHAR_CARRIAGE_RETURN === following) {
        isPair = isExplicitPair = true;
        state.position += 1;
        state.character = following;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    if ((isExplicitPair || state.line === _line) && CHAR_COLON === state.character) {
      isPair = true;
      state.character = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    if (CHAR_COMMA === state.character) {
      readNext = true;
      state.character = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false;

  switch (state.character) {
  case CHAR_VERTICAL_LINE:
    folding = false;
    break;

  case CHAR_GREATER_THAN:
    folding = true;
    break;

  default:
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (state.position < state.length) {
    state.character = state.input.charCodeAt(++state.position);

    if (CHAR_PLUS === state.character || CHAR_MINUS === state.character) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (CHAR_PLUS === state.character) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if (CHAR_DIGIT_ZERO <= state.character && state.character <= CHAR_DIGIT_NINE) {
      if (CHAR_DIGIT_ZERO === state.character) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + (state.character - CHAR_DIGIT_ONE);
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (CHAR_SPACE === state.character || CHAR_TAB === state.character) {
    do { state.character = state.input.charCodeAt(++state.position); }
    while (CHAR_SPACE === state.character || CHAR_TAB === state.character);

    if (CHAR_SHARP === state.character) {
      do { state.character = state.input.charCodeAt(++state.position); }
      while (state.position < state.length &&
             CHAR_LINE_FEED !== state.character &&
             CHAR_CARRIAGE_RETURN !== state.character);
    }
  }

  while (state.position < state.length) {
    readLineBreak(state);
    state.lineIndent = 0;

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (CHAR_SPACE === state.character)) {
      state.lineIndent += 1;
      state.character = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (CHAR_LINE_FEED === state.character || CHAR_CARRIAGE_RETURN === state.character) {
      emptyLines += 1;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      switch (chomping) {
      case CHOMPING_KEEP:
        state.result += common.repeat('\n', emptyLines);
        break;

      case CHOMPING_CLIP:
        if (detectedIndent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
        break;
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (CHAR_SPACE === state.character || CHAR_TAB === state.character) {
        atMoreIndented = true;
        state.result += common.repeat('\n', emptyLines + 1);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (0 === emptyLines) {
        if (detectedIndent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {

      // If current line isn't the first one - count line break from the last content line.
      if (detectedIndent) {
        state.result += common.repeat('\n', emptyLines + 1);

      // In case of the first content line - count only empty lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }
    }

    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    do { state.character = state.input.charCodeAt(++state.position); }
    while (state.position < state.length &&
           CHAR_LINE_FEED !== state.character &&
           CHAR_CARRIAGE_RETURN !== state.character);

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _result   = [],
      following,
      detected  = false;

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  while (state.position < state.length) {
    if (CHAR_MINUS !== state.character) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (CHAR_SPACE           !== following &&
        CHAR_TAB             !== following &&
        CHAR_LINE_FEED       !== following &&
        CHAR_CARRIAGE_RETURN !== following) {
      break;
    }

    detected = true;
    state.position += 1;
    state.character = following;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    if ((state.line === _line || state.lineIndent > nodeIndent) && state.position < state.length) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  } else {
    return false;
  }
}

function readBlockMapping(state, nodeIndent) {
  var following,
      allowCompact,
      _line,
      _tag          = state.tag,
      _result       = {},
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false;

  if (null !== state.anchor) {
    state.anchorMap[state.anchor] = _result;
  }

  while (state.position < state.length) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((CHAR_QUESTION        === state.character ||
         CHAR_COLON           === state.character) &&
        (CHAR_SPACE           === following ||
         CHAR_TAB             === following ||
         CHAR_LINE_FEED       === following ||
         CHAR_CARRIAGE_RETURN === following)) {

      if (CHAR_QUESTION === state.character) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. CHAR_COLON === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
      }

      state.position += 1;
      state.character = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, nodeIndent, CONTEXT_FLOW_OUT, false, true)) {
      if (state.line === _line) {
        while (CHAR_SPACE === state.character ||
               CHAR_TAB === state.character) {
          state.character = state.input.charCodeAt(++state.position);
        }

        if (CHAR_COLON === state.character) {
          state.character = state.input.charCodeAt(++state.position);

          if (CHAR_SPACE           !== state.character &&
              CHAR_TAB             !== state.character &&
              CHAR_LINE_FEED       !== state.character &&
              CHAR_CARRIAGE_RETURN !== state.character) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        return true; // Keep the result of `composeNode`.
      }

    } else {
      break; // Reading is done. Go to the epilogue.
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, keyTag, keyNode, valueNode);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
    }

    if (state.lineIndent > nodeIndent && state.position < state.length) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, keyTag, keyNode, null);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName;

  if (CHAR_EXCLAMATION !== state.character) {
    return false;
  }

  if (null !== state.tag) {
    throwError(state, 'duplication of a tag property');
  }

  state.character = state.input.charCodeAt(++state.position);

  if (CHAR_LESS_THAN === state.character) {
    isVerbatim = true;
    state.character = state.input.charCodeAt(++state.position);

  } else if (CHAR_EXCLAMATION === state.character) {
    isNamed = true;
    tagHandle = '!!';
    state.character = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { state.character = state.input.charCodeAt(++state.position); }
    while (state.position < state.length && CHAR_GREATER_THAN !== state.character);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      state.character = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (state.position < state.length &&
           CHAR_SPACE           !== state.character &&
           CHAR_TAB             !== state.character &&
           CHAR_LINE_FEED       !== state.character &&
           CHAR_CARRIAGE_RETURN !== state.character) {

      if (CHAR_EXCLAMATION === state.character) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      state.character = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if ('!' === tagHandle) {
    state.tag = '!' + tagName;

  } else if ('!!' === tagHandle) {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position;

  if (CHAR_AMPERSAND !== state.character) {
    return false;
  }

  if (null !== state.anchor) {
    throwError(state, 'duplication of an anchor property');
  }

  state.character = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (state.position < state.length &&
         CHAR_SPACE                !== state.character &&
         CHAR_TAB                  !== state.character &&
         CHAR_LINE_FEED            !== state.character &&
         CHAR_CARRIAGE_RETURN      !== state.character &&
         CHAR_COMMA                !== state.character &&
         CHAR_LEFT_SQUARE_BRACKET  !== state.character &&
         CHAR_RIGHT_SQUARE_BRACKET !== state.character &&
         CHAR_LEFT_CURLY_BRACKET   !== state.character &&
         CHAR_RIGHT_CURLY_BRACKET  !== state.character) {
    state.character = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias;

  if (CHAR_ASTERISK !== state.character) {
    return false;
  }

  state.character = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (state.position < state.length &&
         CHAR_SPACE                !== state.character &&
         CHAR_TAB                  !== state.character &&
         CHAR_LINE_FEED            !== state.character &&
         CHAR_CARRIAGE_RETURN      !== state.character &&
         CHAR_COMMA                !== state.character &&
         CHAR_LEFT_SQUARE_BRACKET  !== state.character &&
         CHAR_RIGHT_SQUARE_BRACKET !== state.character &&
         CHAR_LEFT_CURLY_BRACKET   !== state.character &&
         CHAR_RIGHT_CURLY_BRACKET  !== state.character) {
    state.character = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!state.anchorMap.hasOwnProperty(alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      atNewLine  = false,
      isIndented = true,
      hasContent = false,
      typeIndex,
      typeQuantity,
      type,
      flowIndent,
      blockIndent,
      _result;

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent === parentIndent) {
        isIndented = false;

      } else if (state.lineIndent > parentIndent) {
        isIndented = true;

      } else {
        return false;
      }
    }
  }

  if (isIndented) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          isIndented = true;
          allowBlockCollections = allowBlockStyles;

        } else if (state.lineIndent === parentIndent) {
          isIndented = false;
          allowBlockCollections = allowBlockStyles;

        } else {
          return true;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (isIndented || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (isIndented) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (null !== state.tag || null !== state.anchor) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (null === state.tag) {
            state.tag = '?';
          }
        }

        if (null !== state.anchor) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (null !== state.tag && '!' !== state.tag) {
    if ('?' === state.tag) {
      for (typeIndex = 0, typeQuantity = state.implicitTypes.length;
           typeIndex < typeQuantity;
           typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only assigned to plain scalars. So, it isn't
        // needed to check for 'kind' conformity.

        if (type.loadResolver && type.loadResolver(state)) { // `state.result` updated in resolver if matched
          state.tag = type.tag;
          break;
        }

      }
    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
      type = state.typeMap[state.tag];

      if (null !== state.result && type.loadKind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.loadKind + '", not "' + state.kind + '"');
      }

      if (type.loadResolver && !type.loadResolver(state)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      }
    } else {
      throwWarning(state, 'unknown tag !<' + state.tag + '>');
    }
  }

  return null !== state.tag || null !== state.anchor || hasContent;
}

function readDocument(state, iterator) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};

  while (state.position < state.length) {
    skipSeparationSpace(state, true, -1);

    if (state.lineIndent > 0 || CHAR_PERCENT !== state.character) {
      break;
    }

    hasDirectives = true;
    state.character = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (state.position < state.length &&
           CHAR_SPACE           !== state.character &&
           CHAR_TAB             !== state.character &&
           CHAR_LINE_FEED       !== state.character &&
           CHAR_CARRIAGE_RETURN !== state.character) {
      state.character = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (state.position < state.length) {
      while (CHAR_SPACE === state.character || CHAR_TAB === state.character) {
        state.character = state.input.charCodeAt(++state.position);
      }

      if (CHAR_SHARP === state.character) {
        do { state.character = state.input.charCodeAt(++state.position); }
        while (state.position < state.length &&
               CHAR_LINE_FEED !== state.character &&
               CHAR_CARRIAGE_RETURN !== state.character);
        break;
      }

      if (CHAR_LINE_FEED === state.character || CHAR_CARRIAGE_RETURN === state.character) {
        break;
      }

      _position = state.position;

      while (state.position < state.length &&
             CHAR_SPACE           !== state.character &&
             CHAR_TAB             !== state.character &&
             CHAR_LINE_FEED       !== state.character &&
             CHAR_CARRIAGE_RETURN !== state.character) {
        state.character = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (state.position < state.length) {
      readLineBreak(state);
    }

    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (0 === state.lineIndent &&
      CHAR_MINUS === state.character &&
      CHAR_MINUS === state.input.charCodeAt(state.position + 1) &&
      CHAR_MINUS === state.input.charCodeAt(state.position + 2)) {
    state.position += 3;
    state.character = state.input.charCodeAt(state.position);
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  iterator(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (CHAR_DOT === state.character) {
      state.position += 3;
      state.character = state.input.charCodeAt(state.position);
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < state.length) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}



function loadAll(input, iterator, options) {
  options = options || {};

  var state = new State(input, options);

  if (PATTERN_NON_PRINTABLE.test(state.input)) {
    throwError(state, 'the stream contains non-printable characters');
  }

  while (CHAR_SPACE === state.character) {
    state.lineIndent += 1;
    state.character = state.input.charCodeAt(++state.position);
  }

  while (state.position < state.length) {
    readDocument(state, iterator);
  }
}


function load(input, options) {
  var result = null, received = false;

  function iterator(data) {
    if (!received) {
      result = data;
      received = true;
    } else {
      throw new YAMLException('expected a single document in the stream, but found more');
    }
  }

  loadAll(input, iterator, options);

  return result;
}


function safeLoadAll(input, output, options) {
  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


function safeLoad(input, options) {
  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}


module.exports.loadAll     = loadAll;
module.exports.load        = load;
module.exports.safeLoadAll = safeLoadAll;
module.exports.safeLoad    = safeLoad;

},{"./common":3,"./exception":5,"./mark":7,"./schema/default_full":10,"./schema/default_safe":11}],7:[function(require,module,exports){
'use strict';


var common = require('./common');


function Mark(name, buffer, position, line, column) {
  this.name     = name;
  this.buffer   = buffer;
  this.position = position;
  this.line     = line;
  this.column   = column;
}


Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;

  if (!this.buffer) {
    return null;
  }

  indent = indent || 4;
  maxLength = maxLength || 75;

  head = '';
  start = this.position;

  while (start > 0 && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1))) {
    start -= 1;
    if (this.position - start > (maxLength / 2 - 1)) {
      head = ' ... ';
      start += 5;
      break;
    }
  }

  tail = '';
  end = this.position;

  while (end < this.buffer.length && -1 === '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end))) {
    end += 1;
    if (end - this.position > (maxLength / 2 - 1)) {
      tail = ' ... ';
      end -= 5;
      break;
    }
  }

  snippet = this.buffer.slice(start, end);

  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
         common.repeat(' ', indent + this.position - start + head.length) + '^';
};


Mark.prototype.toString = function toString(compact) {
  var snippet, where = '';

  if (this.name) {
    where += 'in "' + this.name + '" ';
  }

  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

  if (!compact) {
    snippet = this.getSnippet();

    if (snippet) {
      where += ':\n' + snippet;
    }
  }

  return where;
};


module.exports = Mark;

},{"./common":3}],8:[function(require,module,exports){
'use strict';


var common        = require('./common');
var YAMLException = require('./exception');
var Type          = require('./type');


function compileList(schema, name, result) {
  var exclude = [];

  schema.include.forEach(function (includedSchema) {
    result = compileList(includedSchema, name, result);
  });

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag) {
        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return -1 === exclude.indexOf(index);
  });
}


function compileMap(/* lists... */) {
  var result = {}, index, length;

  function collectType(type) {
    result[type.tag] = type;
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }

  return result;
}


function Schema(definition) {
  this.include  = definition.include  || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];

  this.implicit.forEach(function (type) {
    if (type.loadKind && 'scalar' !== type.loadKind) {
      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }
  });

  this.compiledImplicit = compileList(this, 'implicit', []);
  this.compiledExplicit = compileList(this, 'explicit', []);
  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
}


Schema.DEFAULT = null;


Schema.create = function createSchema() {
  var schemas, types;

  switch (arguments.length) {
  case 1:
    schemas = Schema.DEFAULT;
    types = arguments[0];
    break;

  case 2:
    schemas = arguments[0];
    types = arguments[1];
    break;

  default:
    throw new YAMLException('Wrong number of arguments for Schema.create function');
  }

  schemas = common.toArray(schemas);
  types = common.toArray(types);

  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
  }

  if (!types.every(function (type) { return type instanceof Type; })) {
    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
  }

  return new Schema({
    include: schemas,
    explicit: types
  });
};


module.exports = Schema;

},{"./common":3,"./exception":5,"./type":14}],9:[function(require,module,exports){
// Standard YAML's Core schema.
// http://www.yaml.org/spec/1.2/spec.html#id2804923
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, Core schema has no distinctions from JSON schema is JS-YAML.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./json')
  ]
});

},{"../schema":8,"./json":13}],10:[function(require,module,exports){
// JS-YAML's default schema for `load` function.
// It is not described in the YAML specification.
//
// This schema is based on JS-YAML's default safe schema and includes
// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
//
// Also this schema is used as default base schema at `Schema.create` function.


'use strict';


var Schema = require('../schema');


module.exports = Schema.DEFAULT = new Schema({
  include: [
    require('./default_safe')
  ],
  explicit: [
    require('../type/js/undefined'),
    require('../type/js/regexp'),
    require('../type/js/function')
  ]
});

},{"../schema":8,"../type/js/function":19,"../type/js/regexp":20,"../type/js/undefined":21,"./default_safe":11}],11:[function(require,module,exports){
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./core')
  ],
  implicit: [
    require('../type/timestamp'),
    require('../type/merge')
  ],
  explicit: [
    require('../type/binary'),
    require('../type/omap'),
    require('../type/pairs'),
    require('../type/set')
  ]
});

},{"../schema":8,"../type/binary":15,"../type/merge":23,"../type/omap":25,"../type/pairs":26,"../type/set":28,"../type/timestamp":30,"./core":9}],12:[function(require,module,exports){
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  explicit: [
    require('../type/str'),
    require('../type/seq'),
    require('../type/map')
  ]
});

},{"../schema":8,"../type/map":22,"../type/seq":27,"../type/str":29}],13:[function(require,module,exports){
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.


'use strict';


var Schema = require('../schema');


module.exports = new Schema({
  include: [
    require('./failsafe')
  ],
  implicit: [
    require('../type/null'),
    require('../type/bool'),
    require('../type/int'),
    require('../type/float')
  ]
});

},{"../schema":8,"../type/bool":16,"../type/float":17,"../type/int":18,"../type/null":24,"./failsafe":12}],14:[function(require,module,exports){
'use strict';


var YAMLException = require('./exception');


var TYPE_CONSTRUCTOR_OPTIONS = [
  'loadKind',
  'loadResolver',
  'dumpInstanceOf',
  'dumpPredicate',
  'dumpRepresenter',
  'dumpDefaultStyle',
  'dumpStyleAliases'
];


var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];


function compileStyleAliases(map) {
  var result = {};

  if (null !== map) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}


function Type(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (-1 === TYPE_CONSTRUCTOR_OPTIONS.indexOf(name)) {
      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag              = tag;
  this.loadKind         = options['loadKind']         || null;
  this.loadResolver     = options['loadResolver']     || null;
  this.dumpInstanceOf   = options['dumpInstanceOf']   || null;
  this.dumpPredicate    = options['dumpPredicate']    || null;
  this.dumpRepresenter  = options['dumpRepresenter']  || null;
  this.dumpDefaultStyle = options['dumpDefaultStyle'] || null;
  this.dumpStyleAliases = compileStyleAliases(options['dumpStyleAliases'] || null);

  if (-1 === YAML_NODE_KINDS.indexOf(this.loadKind)) {
    throw new YAMLException('Unknown loadKind "' + this.loadKind + '" is specified for "' + tag + '" YAML type.');
  }
}


module.exports = Type;

},{"./exception":5}],15:[function(require,module,exports){
// Modified from:
// https://raw.github.com/kanaka/noVNC/d890e8640f20fba3215ba7be8e0ff145aeb8c17c/include/base64.js

'use strict';


var NodeBuffer;
try {
  NodeBuffer = require('buffer').Buffer; // A trick for browserified version.
} catch (_) {}

var Type       = require('../type');



var BASE64_PADDING = '=';

var BASE64_BINTABLE = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1,  0, -1, -1,
  -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
];

var BASE64_CHARTABLE =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');


function resolveYamlBinary(state) {
  var value, code, idx = 0, result = [], leftbits, leftdata,
      object = state.result;

  leftbits = 0; // number of bits decoded, but yet to be appended
  leftdata = 0; // bits decoded, but yet to be appended

  // Convert one by one.
  for (idx = 0; idx < object.length; idx += 1) {
    code = object.charCodeAt(idx);
    value = BASE64_BINTABLE[code & 0x7F];

    // Skip LF(NL) || CR
    if (0x0A !== code && 0x0D !== code) {
      // Fail on illegal characters
      if (-1 === value) {
        return false;
      }

      // Collect data into leftdata, update bitcount
      leftdata = (leftdata << 6) | value;
      leftbits += 6;

      // If we have 8 or more bits, append 8 bits to the result
      if (leftbits >= 8) {
        leftbits -= 8;

        // Append if not padding.
        if (BASE64_PADDING !== object.charAt(idx)) {
          result.push((leftdata >> leftbits) & 0xFF);
        }

        leftdata &= (1 << leftbits) - 1;
      }
    }
  }

  // If there are any bits left, the base64 string was corrupted
  if (leftbits) {
    return false;
  } else {
    // Wrap into Buffer for NodeJS and leave Array for browser
    if (NodeBuffer && NodeBuffer.isBuffer) {
      state.result = new NodeBuffer(result);
    } else {
      state.result = result;
    }
    return true;
  }
}


function representYamlBinary(object /*, style*/) {
  var result = '', index, length, rest;

  // Convert every three bytes to 4 ASCII characters.
  for (index = 0, length = object.length - 2; index < length; index += 3) {
    result += BASE64_CHARTABLE[object[index + 0] >> 2];
    result += BASE64_CHARTABLE[((object[index + 0] & 0x03) << 4) + (object[index + 1] >> 4)];
    result += BASE64_CHARTABLE[((object[index + 1] & 0x0F) << 2) + (object[index + 2] >> 6)];
    result += BASE64_CHARTABLE[object[index + 2] & 0x3F];
  }

  rest = object.length % 3;

  // Convert the remaining 1 or 2 bytes, padding out to 4 characters.
  if (0 !== rest) {
    index = object.length - rest;
    result += BASE64_CHARTABLE[object[index + 0] >> 2];

    if (2 === rest) {
      result += BASE64_CHARTABLE[((object[index + 0] & 0x03) << 4) + (object[index + 1] >> 4)];
      result += BASE64_CHARTABLE[(object[index + 1] & 0x0F) << 2];
      result += BASE64_PADDING;
    } else {
      result += BASE64_CHARTABLE[(object[index + 0] & 0x03) << 4];
      result += BASE64_PADDING + BASE64_PADDING;
    }
  }

  return result;
}


function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}


module.exports = new Type('tag:yaml.org,2002:binary', {
  loadKind: 'scalar',
  loadResolver: resolveYamlBinary,
  dumpPredicate: isBinary,
  dumpRepresenter: representYamlBinary
});

},{"../type":14,"buffer":31}],16:[function(require,module,exports){
'use strict';


var Type = require('../type');


var YAML_IMPLICIT_BOOLEAN_MAP = {
  'true'  : true,
  'True'  : true,
  'TRUE'  : true,
  'false' : false,
  'False' : false,
  'FALSE' : false
};

/*var YAML_EXPLICIT_BOOLEAN_MAP = {
  'true'  : true,
  'True'  : true,
  'TRUE'  : true,
  'false' : false,
  'False' : false,
  'FALSE' : false,
  'y'     : true,
  'Y'     : true,
  'yes'   : true,
  'Yes'   : true,
  'YES'   : true,
  'n'     : false,
  'N'     : false,
  'no'    : false,
  'No'    : false,
  'NO'    : false,
  'on'    : true,
  'On'    : true,
  'ON'    : true,
  'off'   : false,
  'Off'   : false,
  'OFF'   : false
};*/


function resolveYamlBoolean(state) {
  if (YAML_IMPLICIT_BOOLEAN_MAP.hasOwnProperty(state.result)) {
    state.result = YAML_IMPLICIT_BOOLEAN_MAP[state.result];
    return true;
  } else {
    return false;
  }
}


function isBoolean(object) {
  return '[object Boolean]' === Object.prototype.toString.call(object);
}


module.exports = new Type('tag:yaml.org,2002:bool', {
  loadKind: 'scalar',
  loadResolver: resolveYamlBoolean,
  dumpPredicate: isBoolean,
  dumpRepresenter: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  dumpDefaultStyle: 'lowercase'
});

},{"../type":14}],17:[function(require,module,exports){
'use strict';


var Type = require('../type');


var YAML_FLOAT_PATTERN = new RegExp(
  '^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' +
  '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' +
  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
  '|[-+]?\\.(?:inf|Inf|INF)' +
  '|\\.(?:nan|NaN|NAN))$');


function resolveYamlFloat(state) {
  var value, sign, base, digits,
      object = state.result;

  if (!YAML_FLOAT_PATTERN.test(object)) {
    return false;
  }

  value  = object.replace(/_/g, '').toLowerCase();
  sign   = '-' === value[0] ? -1 : 1;
  digits = [];

  if (0 <= '+-'.indexOf(value[0])) {
    value = value.slice(1);
  }

  if ('.inf' === value) {
    state.result = (1 === sign) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    return true;

  } else if ('.nan' === value) {
    state.result = NaN;
    return true;

  } else if (0 <= value.indexOf(':')) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseFloat(v, 10));
    });

    value = 0.0;
    base = 1;

    digits.forEach(function (d) {
      value += d * base;
      base *= 60;
    });

    state.result = sign * value;
    return true;

  } else {
    state.result = sign * parseFloat(value, 10);
    return true;
  }
}


function representYamlFloat(object, style) {
  if (isNaN(object)) {
    switch (style) {
    case 'lowercase':
      return '.nan';
    case 'uppercase':
      return '.NAN';
    case 'camelcase':
      return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
    case 'lowercase':
      return '.inf';
    case 'uppercase':
      return '.INF';
    case 'camelcase':
      return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
    case 'lowercase':
      return '-.inf';
    case 'uppercase':
      return '-.INF';
    case 'camelcase':
      return '-.Inf';
    }
  } else {
    return object.toString(10);
  }
}


function isFloat(object) {
  return ('[object Number]' === Object.prototype.toString.call(object)) &&
         (0 !== object % 1);
}


module.exports = new Type('tag:yaml.org,2002:float', {
  loadKind: 'scalar',
  loadResolver: resolveYamlFloat,
  dumpPredicate: isFloat,
  dumpRepresenter: representYamlFloat,
  dumpDefaultStyle: 'lowercase'
});

},{"../type":14}],18:[function(require,module,exports){
'use strict';


var Type = require('../type');


var YAML_INTEGER_PATTERN = new RegExp(
  '^(?:[-+]?0b[0-1_]+' +
  '|[-+]?0[0-7_]+' +
  '|[-+]?(?:0|[1-9][0-9_]*)' +
  '|[-+]?0x[0-9a-fA-F_]+' +
  '|[-+]?[1-9][0-9_]*(?::[0-5]?[0-9])+)$');


function resolveYamlInteger(state) {
  var value, sign, base, digits,
      object = state.result;

  if (!YAML_INTEGER_PATTERN.test(object)) {
    return false;
  }

  value  = object.replace(/_/g, '');
  sign   = '-' === value[0] ? -1 : 1;
  digits = [];

  if (0 <= '+-'.indexOf(value[0])) {
    value = value.slice(1);
  }

  if ('0' === value) {
    state.result = 0;
    return true;

  } else if (/^0b/.test(value)) {
    state.result = sign * parseInt(value.slice(2), 2);
    return true;

  } else if (/^0x/.test(value)) {
    state.result = sign * parseInt(value, 16);
    return true;

  } else if ('0' === value[0]) {
    state.result = sign * parseInt(value, 8);
    return true;

  } else if (0 <= value.indexOf(':')) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseInt(v, 10));
    });

    value = 0;
    base = 1;

    digits.forEach(function (d) {
      value += (d * base);
      base *= 60;
    });

    state.result = sign * value;
    return true;

  } else {
    state.result = sign * parseInt(value, 10);
    return true;
  }
}


function isInteger(object) {
  return ('[object Number]' === Object.prototype.toString.call(object)) &&
         (0 === object % 1);
}


module.exports = new Type('tag:yaml.org,2002:int', {
  loadKind: 'scalar',
  loadResolver: resolveYamlInteger,
  dumpPredicate: isInteger,
  dumpRepresenter: {
    binary:      function (object) { return '0b' + object.toString(2); },
    octal:       function (object) { return '0'  + object.toString(8); },
    decimal:     function (object) { return        object.toString(10); },
    hexadecimal: function (object) { return '0x' + object.toString(16).toUpperCase(); }
  },
  dumpDefaultStyle: 'decimal',
  dumpStyleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

},{"../type":14}],19:[function(require,module,exports){
'use strict';


var esprima;

// Browserified version does not have esprima
//
// 1. For node.js just require module as deps
// 2. For browser try to require mudule via external AMD system.
//    If not found - try to fallback to window.esprima. If not
//    found too - then fail to parse.
//
try {
  esprima = require('esprima');
} catch (_) {
  /*global window */
  if (window) { esprima = window.esprima; }
}


var Type = require('../../type');


function resolveJavascriptFunction(state) {
  /*jslint evil:true*/

  try {
    var source = '(' + state.result + ')',
        ast    = esprima.parse(source, { range: true }),
        params = [],
        body;

    if ('Program'             !== ast.type         ||
        1                     !== ast.body.length  ||
        'ExpressionStatement' !== ast.body[0].type ||
        'FunctionExpression'  !== ast.body[0].expression.type) {
      return false;
    }

    ast.body[0].expression.params.forEach(function (param) {
      params.push(param.name);
    });

    body = ast.body[0].expression.body.range;

    // Esprima's ranges include the first '{' and the last '}' characters on
    // function expressions. So cut them out.
    state.result = new Function(params, source.slice(body[0]+1, body[1]-1));
    return true;
  } catch (err) {
    return false;
  }
}


function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}


function isFunction(object) {
  return '[object Function]' === Object.prototype.toString.call(object);
}


module.exports = new Type('tag:yaml.org,2002:js/function', {
  loadKind: 'scalar',
  loadResolver: resolveJavascriptFunction,
  dumpPredicate: isFunction,
  dumpRepresenter: representJavascriptFunction
});

},{"../../type":14,"esprima":"S2ZkVY"}],20:[function(require,module,exports){
'use strict';


var Type = require('../../type');


function resolveJavascriptRegExp(state) {
  var regexp = state.result,
      tail   = /\/([gim]*)$/.exec(state.result),
      modifiers;

  // `/foo/gim` - tail can be maximum 4 chars
  if ('/' === regexp[0] && tail && 4 >= tail[0].length) {
    regexp = regexp.slice(1, regexp.length - tail[0].length);
    modifiers = tail[1];
  }

  try {
    state.result =  new RegExp(regexp, modifiers);
    return true;
  } catch (error) {
    return false;
  }
}


function representJavascriptRegExp(object /*, style*/) {
  var result = '/' + object.source + '/';

  if (object.global) {
    result += 'g';
  }

  if (object.multiline) {
    result += 'm';
  }

  if (object.ignoreCase) {
    result += 'i';
  }

  return result;
}


function isRegExp(object) {
  return '[object RegExp]' === Object.prototype.toString.call(object);
}


module.exports = new Type('tag:yaml.org,2002:js/regexp', {
  loadKind: 'scalar',
  loadResolver: resolveJavascriptRegExp,
  dumpPredicate: isRegExp,
  dumpRepresenter: representJavascriptRegExp
});

},{"../../type":14}],21:[function(require,module,exports){
'use strict';


var Type = require('../../type');


function resolveJavascriptUndefined(state) {
  state.result = undefined;
  return true;
}


function representJavascriptUndefined(/*object, explicit*/) {
  return '';
}


function isUndefined(object) {
  return 'undefined' === typeof object;
}


module.exports = new Type('tag:yaml.org,2002:js/undefined', {
  loadKind: 'scalar',
  loadResolver: resolveJavascriptUndefined,
  dumpPredicate: isUndefined,
  dumpRepresenter: representJavascriptUndefined
});

},{"../../type":14}],22:[function(require,module,exports){
'use strict';


var Type = require('../type');


module.exports = new Type('tag:yaml.org,2002:map', {
  loadKind: 'mapping'
});

},{"../type":14}],23:[function(require,module,exports){
'use strict';


var Type = require('../type');


function resolveYamlMerge(state) {
  return '<<' === state.result;
}


module.exports = new Type('tag:yaml.org,2002:merge', {
  loadKind: 'scalar',
  loadResolver: resolveYamlMerge
});

},{"../type":14}],24:[function(require,module,exports){
'use strict';


var Type = require('../type');


var YAML_NULL_MAP = {
  '~'    : true,
  'null' : true,
  'Null' : true,
  'NULL' : true
};


function resolveYamlNull(state) {
  if (YAML_NULL_MAP[state.result]) {
    state.result = null;
    return true;
  }
  return false;
}


function isNull(object) {
  return null === object;
}


module.exports = new Type('tag:yaml.org,2002:null', {
  loadKind: 'scalar',
  loadResolver: resolveYamlNull,
  dumpPredicate: isNull,
  dumpRepresenter: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; }
  },
  dumpDefaultStyle: 'lowercase'
});

},{"../type":14}],25:[function(require,module,exports){
'use strict';


var Type = require('../type');


var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString       = Object.prototype.toString;


function resolveYamlOmap(state) {
  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = state.result;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) {
          pairHasKey = true;
        } else {
          return false;
        }
      }
    }

    if (!pairHasKey) {
      return false;
    }

    if (-1 === objectKeys.indexOf(pairKey)) {
      objectKeys.push(pairKey);
    } else {
      return false;
    }
  }

  return true;
}


module.exports = new Type('tag:yaml.org,2002:omap', {
  loadKind: 'sequence',
  loadResolver: resolveYamlOmap
});

},{"../type":14}],26:[function(require,module,exports){
'use strict';


var Type = require('../type');


var _toString = Object.prototype.toString;


function resolveYamlPairs(state) {
  var index, length, pair, keys, result,
      object = state.result;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    keys = Object.keys(pair);

    if (1 !== keys.length) {
      return false;
    }

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  state.result = result;
  return true;
}


module.exports = new Type('tag:yaml.org,2002:pairs', {
  loadKind: 'sequence',
  loadResolver: resolveYamlPairs
});

},{"../type":14}],27:[function(require,module,exports){
'use strict';


var Type = require('../type');


module.exports = new Type('tag:yaml.org,2002:seq', {
  loadKind: 'sequence'
});

},{"../type":14}],28:[function(require,module,exports){
'use strict';


var Type = require('../type');


var _hasOwnProperty = Object.prototype.hasOwnProperty;


function resolveYamlSet(state) {
  var key, object = state.result;

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (null !== object[key]) {
        return false;
      }
    }
  }

  return true;
}


module.exports = new Type('tag:yaml.org,2002:set', {
  loadKind: 'mapping',
  loadResolver: resolveYamlSet
});

},{"../type":14}],29:[function(require,module,exports){
'use strict';


var Type = require('../type');


module.exports = new Type('tag:yaml.org,2002:str', {
  loadKind: 'scalar'
});

},{"../type":14}],30:[function(require,module,exports){
'use strict';


var Type = require('../type');


var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:(?:[Tt]|[ \\t]+)'              + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?)?$');         // [11] tz_minute


function resolveYamlTimestamp(state) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, data;

  match = YAML_TIMESTAMP_REGEXP.exec(state.result);

  if (null === match) {
    return false;
  }

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    state.result = new Date(Date.UTC(year, month, day));
    return true;
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if ('-' === match[9]) {
      delta = -delta;
    }
  }

  data = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) {
    data.setTime(data.getTime() - delta);
  }

  state.result = data;
  return true;
}


function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}


module.exports = new Type('tag:yaml.org,2002:timestamp', {
  loadKind: 'scalar',
  loadResolver: resolveYamlTimestamp,
  dumpInstanceOf: Date,
  dumpRepresenter: representYamlTimestamp
});

},{"../type":14}],31:[function(require,module,exports){

},{}]},{},[1])
(1)
});
;