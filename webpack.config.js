const path = require("path");
const webpack=require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
  entry:{
  	'vendor': ['polyfill','vue','common'],
    'index':'./src/components/index/index.js',
    'admin':'./src/components/admin/index.js',
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name]_[chunkhash].js"
  },
 resolve: {
    alias: {
    	'common$':path.resolve(__dirname, "./src/lib/common.js"),
      'vue$': path.resolve(__dirname, "./src/lib/vue.js"),
      'polyfill$': path.resolve(__dirname, "./src/lib/polyfill.js")
    }
},
   module: {
    loaders: [
    		{test: /\.vue$/,loader: 'vue-loader'},
        {test:/\.js$/,exclude: /node_modules/,loader: 'babel-loader', query: {presets: ['es2015']}},
       
        {
        	test: /\.css$/,
        	loader:ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
					      loader: 'css-loader'
					    }
            ]
         	})
        },
        {test: /\.scss$/, loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
	            {
					      loader: 'css-loader',
					      options: {
							    minimize: true
							  }
					    },
					    {
					      loader: 'sass-loader',
					      options: {
							    minimize: true
							  }
					    }
            ]
         	})
       },
        {test: /\.html$/,loader:'html-loader'},
        {test: /\.(png|jpg|jpge)$/, loader: 'file-loader',query:{
        	name:'./static/images/[name].[ext]'
        }},
        {
			    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			    loader: 'file-loader',
			    query: {
			      limit: 10000,
			      name: './fonts/[name].[ext]',
			      publicPath:'/'
			    }
		  	}
    ]
   },
   devServer:{
    historyApiFallback:true,
    inline:true,
    port:8888
	},
	plugins: [
		new CleanWebpackPlugin(
	    ['dist/main_*.js','dist/vendor_*.js'],
	    {
        root: __dirname,
        verbose:  false,
        dry:      false
	    }
	  ),
		new ExtractTextPlugin("./static/css/style.min.css"),
	  new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor'],
    }),/*
    new webpack.optimize.UglifyJsPlugin({
	    compress: {
	        warnings: false
	    }
		}),*/
		new HtmlWebpackPlugin({
			filename:'index.html',
			template: './src/index.html',
			chunks:['vendor','index']
		}),
		new HtmlWebpackPlugin({
			filename:'admin.html',
			template: './src/admin.html',
			chunks:['vendor','admin']
		})
  ]
   
};