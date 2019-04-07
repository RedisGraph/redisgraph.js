/**
 * A node within the garph.
 */
class Node {

	/**
	 * Creates a node with provided alias, label and properties
	 * 
	 * @param nodeId The id to identify the node uniquely
	 * @param alias The alias that we wish to give to the node
	 * @param label The label associated with the node
	 * @param properties The properties of the node
	 */
	constructor (nodeId = null, alias = null, label = null, properties = null) {
	  this.id = nodeId;
	  this.alias = alias;
	  this.label = label;
	  this.properties = properties;
	}
	
	/**
	 * To set alias for the node
	 * 
	 *  @param alias The alias to be set for the node.
	 */
	setAlias (alias) {
		this.alias = alias;
	}

	/**
	 * To get the value of the alias set for the node
	 * 
	 * @return the alias of the node
	 */
	getAlias () {
		return this.alias;
	}
  
	  /**
	   * TO get the node in a string format.
	   * So that it can be added to the graph query
	   * 
	   * @return Node details in a string
	   */
	toString () {
		  let nodeString = '(';
	  
		  // Adding the alias to the node string
		  nodeString += (this.alias || '');
	  
		  // Adding the label to the node string
		if (this.label !== null) {
			nodeString += ':' + this.label;
		}
		
		if (this.properties && this.properties !== {}){
		// Formating properties to add to the string
		let properties = JSON.stringify(this.properties);

		// Removing the double quotes around the keys
		properties = properties.replace(/\"(\w*)\":/g, "$1:");

		// Adding the properties to the node string
		// Giving the space = 2 by default
		nodeString += ' ' + properties;
		}

		nodeString += ')';
	
		return nodeString;
	}
}

module.exports = Node;
