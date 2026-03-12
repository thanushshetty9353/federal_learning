nodes = []

def register_node(node_id, organization):

    nodes.append({
        "node_id": node_id,
        "organization": organization,
        "status": "online"
    })


def get_nodes():

    return nodes