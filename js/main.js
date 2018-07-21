var renderer, scene, camera;
var controls, gui, grid, axes;
var reader, objLoader;
var ambientLight, directionalLight;
var phongMaterial;
var object;

var params =
{
	backgroundColor: "#f0f0f0",
	showGrid: true,
	showAxes: true,
	wireframe: false,
	ambientColor: "#404040",
	lightPositionX: 0,
	lightPositionY: 1,
	lightPositionZ: 0,
	lightColor: "#ffffff",
	intensity: 0.5,
	visible: true,
	scale: 0.4,
	diffuseColor: "#ffffff",
	specularColor: "#a7a7a7",
	shininess: 30,
	loadModel : function() { document.getElementById('input').click(); }
};

function init()
{
	// Loader.
	reader = new FileReader();
	objLoader = new THREE.OBJLoader();

	// Material.
	phongMaterial = new THREE.MeshPhongMaterial();
	phongMaterial.flatShading = false;
	phongMaterial.side = THREE.DoubleSide;
	phongMaterial.wireframe = params.wireframe;
	phongMaterial.color = new THREE.Color(params.diffuseColor);
	phongMaterial.specular = new THREE.Color(params.specularColor);
	phongMaterial.shininess = params.shininess;

	// Renderer.
	canvas = document.getElementById("canvas");
	renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Scene.
	scene = new THREE.Scene();
	scene.background = new THREE.Color(params.backgroundColor);
	createScene();

	// Camera.
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
	camera.position.set(1.2, 2, 1.4);

	// Controls.
	// The second argument is a reference to the canvas to disable the controls when you click on the GUI.
	controls = new THREE.OrbitControls(camera, renderer.domElement);

	// GUI.
	createGUI();
}

function animate()
{
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

function createScene()
{
	// Grid.
	var size = 8;
	var divisions = 100;
	grid = new THREE.GridHelper(size, divisions);
	grid.material.transparent = true;
	grid.material.opacity = 0.25;
	grid.visible = params.showGrid;
	scene.add(grid);

	// Axes.
	axes = new THREE.AxesHelper(1.5);
	scene.add(axes);

	// Lights.
	ambientLight = new THREE.AmbientLight(new THREE.Color(params.ambientColor));
	scene.add(ambientLight);
	directionalLight = new THREE.DirectionalLight(new THREE.Color(params.lightColor), params.intensity);
	directionalLight.position.set(params.lightPositionX, params.lightPositionY, params.lightPositionZ);
	directionalLight.target.position.set(0, 0, 0);
	scene.add(directionalLight);

	// Default object.
	objLoader.load("models/teapot.obj", function( obj )
	{
		object = obj;
		initObject(object);
		scene.add(object);
	});
}

function createGUI()
{
	gui = new dat.GUI({ width: 300 });

	// Editor folder.
	var editorFolder = gui.addFolder('Editor');

	editorFolder.addColor(params, "backgroundColor").name("Background Color").onChange(function( color )
	{
		params.backgroundColor = color;
		scene.background = new THREE.Color(params.backgroundColor);
	});

	editorFolder.add(params, "showGrid").name("Show Grid").onChange(function( visible )
	{
		params.showGrid = visible;
		grid.visible = params.showGrid;
	});

	editorFolder.add(params, "showAxes").name("Show Axes").onChange(function( visible )
	{
		params.showAxes = visible;
		axes.visible = params.showAxes;
	});

	// Lighting folder.
	var lightingFolder = gui.addFolder('Lighting');

	lightingFolder.addColor(params, "ambientColor").name("Ambient Color").onChange(function( color )
	{
		params.ambientColor = color;
		ambientLight.color = new THREE.Color(params.ambientColor);
	});

	lightingFolder.add(params, "lightPositionX", -1, 1).name("Light Position X").onChange(function( x )
	{
		params.lightPositionX = x;
		directionalLight.position.x = params.lightPositionX;
	});

	lightingFolder.add(params, "lightPositionY", -1, 1).name("Light Position Y").onChange(function( y )
	{
		params.lightPositionY = y;
		directionalLight.position.y = params.lightPositionY;
	});

	lightingFolder.add(params, "lightPositionZ", -1, 1).name("Light Position Z").onChange(function( z )
	{
		params.lightPositionZ = z;
		directionalLight.position.z = params.lightPositionZ;
	});

	lightingFolder.addColor(params, "lightColor").name("Light Color").onChange(function( color )
	{
		params.lightColor = color;
		directionalLight.color = new THREE.Color(params.lightColor);
	});

	lightingFolder.add(params, "intensity", 0, 5).name("Intensity").onChange(function( intensity )
	{
		params.intensity = intensity;
		directionalLight.intensity = params.intensity;
	});

	// Model folder.
	var modelFolder = gui.addFolder('Model');

	modelFolder.add(params, "visible").name("Visible").onChange(function( visible )
	{
		params.visible = visible;
		object.visible = params.visible;
	});

	modelFolder.add(params, "wireframe").name("Wireframe").onChange(function( wireframe )
	{
		params.wireframe = wireframe;
		phongMaterial.wireframe = params.wireframe;
	});

	modelFolder.add(params, "scale", 0, 5).name("Scale").onChange(function( scale )
	{
		params.scale = scale;
		object.scale.set(params.scale, params.scale, params.scale);
	});

	modelFolder.addColor(params, "diffuseColor").name("Diffuse Color").onChange(function( color )
	{
		params.diffuseColor = color;
		phongMaterial.color = new THREE.Color(params.diffuseColor);
	});

	modelFolder.addColor(params, "specularColor").name("Specular Color").onChange(function( color )
	{
		params.specularColor = color;
		phongMaterial.specular = new THREE.Color(params.specularColor);
	});

	modelFolder.add(params, "shininess", 0, 100).name("Shininess").onChange(function( shininess )
	{
		params.shininess = shininess;
		phongMaterial.shininess = params.shininess;
	});

	// Load model button.
	document.getElementById("input").addEventListener("change", function( event )
	{
		var file = this.files[0];
		var encoding = 'ISO-8859-1'; 
		reader.onload = onLoadModel;
		reader.readAsText(file, encoding);
	}, false);
	gui.add(params, 'loadModel').name('Load Model');
}

function onLoadModel( event )
{
	var result = reader.result;
	var newObject = objLoader.parse(result);

	if( object != null )
	{
		scene.remove(object);
	}

	object = newObject;
	initObject(object);

	scene.add(object);
}

function initObject( obj )
{
	obj.visible = params.visible;
	obj.scale.set(params.scale, params.scale, params.scale);
	obj.traverse(function( child )
	{
		if( child instanceof THREE.Mesh )
		{
			child.material = phongMaterial;
		}
	});
}

init();
animate();