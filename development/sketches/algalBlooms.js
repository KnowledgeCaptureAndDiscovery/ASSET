algal ='{"mainObjects":[{"id":"d1532650314150","name":"Query Database","imageSource":"/images/commonTasks/queryDatabase.png","startX":567.3359375,"startY":500.72187499999995,"endX":668.099296278626,"endY":575.721875,"toolsUsed":[["CHORDS","/images/earthCubeTools/chords.png",53.91373801916933,75],["I-Microbe","/images/earthCubeTools/imicrobe.png",172.0183486238532,75]]},{"id":"d1532650358216","name":"Download Data","imageSource":"/images/commonTasks/downloadData.png","startX":149.3359375,"startY":152.721875,"endX":259.3613182106599,"endY":227.721875,"toolsUsed":[["Excel","/images/commonTools/excel.png",72.91666666666667,75]]},{"id":"d1532650383552","name":"Data Preparation","imageSource":"/images/commonTasks/dataPreparation.png","startX":548.3359375,"startY":158.721875,"endX":671.9328762755102,"endY":233.721875,"toolsUsed":[]},{"id":"d1532650565245","name":"Data","imageSource":"/images/commonTasks/data.png","startX":932.515625,"startY":151.08125,"endX":992.3840460526316,"endY":226.08125,"toolsUsed":[]},{"id":"d1532650595099","name":"Run Code","imageSource":"/images/commonTasks/runCode.png","startX":900.515625,"startY":356.08125,"endX":1030.8894567757009,"endY":431.08125,"toolsUsed":[["Shell script","/images/commonTools/shell.png",79.54545454545455,75]]},{"id":"d1532650665643","name":"Statistical Analysis","imageSource":"/images/commonTasks/statAnalysis.png","startX":1229.0765625,"startY":346.32812499999994,"endX":1312.5900760135135,"endY":421.32812499999994,"toolsUsed":[]},{"id":"d1532650679756","name":"Visualize","imageSource":"/images/commonTasks/visualize.png","startX":1639.8765625,"startY":338.42812499999997,"endX":1712.3051339285716,"endY":413.42812499999997,"toolsUsed":[["Search engine","/images/commonTools/search.png",76.15384615384616,75]]}],"edges":[["d1532650358216","d1532650383552"],["d1532650383552","d1532650565245"],["d1532650565245","d1532650595099"],["d1532650314150","d1532650595099"],["d1532650595099","d1532650665643"],["d1532650665643","d1532650679756"]],"details":[[{"name":"Name","detail":"Real-time sensor data and cyanobacteria data"},{"name":"Description","detail":"Real-time sensor data is hourly water data from sensors installed in Cheney reservoir. Query for relevant variables we want to analyze. Cyanobacteria data provides existing data on the types of organisms found in Cheney reservoir."},{"name":"Author","detail":""},{"name":"Duration","detail":""},{"name":"Tools used","detail":"CHORDS, I-Microbe"}],[{"name":"Name","detail":"Geochemical lab analysis data"},{"name":"Description","detail":"Comprehensive lab results for water samples taken from the reservoir."},{"name":"Author","detail":"Kansas Biological Survey"},{"name":"Duration","detail":""},{"name":"Tools used","detail":"Excel"}],[{"name":"Name","detail":"Select relevant geochemical variables"},{"name":"Description","detail":"Lab data measures for 50+ different geochemical properties so we need to choose the ones we want to compare and format them as json."},{"name":"Author","detail":""},{"name":"Duration","detail":""},{"name":"Tools used","detail":"Python"}],[{"name":"Name","detail":"Create JSON files"},{"name":"Description","detail":"Save variables as JSON files for use with JavaScript libraries"},{"name":"Author","detail":""},{"name":"Duration","detail":""},{"name":"Tools used","detail":""}],[{"name":"Name","detail":"JavaScript APIs"},{"name":"Description","detail":"JavaScript code built with visualization APIs. Loads queried data and JSON files."},{"name":"Author","detail":""},{"name":"Duration","detail":""},{"name":"Tools used","detail":"Highcharts"}],[{"name":"Name","detail":"Generate summary statistics"},{"name":"Description","detail":"Summary statistics informs of max, min, averages within and between variables."},{"name":"Author","detail":""},{"name":"Duration","detail":""},{"name":"Tools used","detail":""}],[{"name":"Name","detail":"Visualize variables to analyze trends"},{"name":"Description","detail":"Visualization allows us to make visual comparisons among and between datasets allowing us to observe trends in algal blooms"},{"name":"Author","detail":"http://interactiveviz.dept.ku.edu/DiscoverCheney/"},{"name":"Duration","detail":""},{"name":"Tools used","detail":"Highcharts"}]],"title":"Finding Causes of Cyanobacterial Harmful Algal Blooms in Cheney Reservoir"}'