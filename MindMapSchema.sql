-- Nexus Docs: The Second Brain Mind Map Schema
-- Database: PostgreSQL
-- Extension: pgvector (for semantic search and node embeddings)

CREATE EXTENSION IF NOT EXISTS vector;

-- Nodes: Represent documents, atomic concepts, or mental models
CREATE TABLE IF NOT EXISTS cognitive_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'document', 'concept', 'mental_model', 'tag'
    title TEXT NOT NULL,
    content TEXT, -- Markdown or Summary
    metadata JSONB DEFAULT '{}',
    embedding vector(1536), -- Sized for text-embedding-004 or similar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Edges: Represent relationships between cognitive nodes
-- Features dynamic weighting for the cognitive engine
CREATE TABLE IF NOT EXISTS cognitive_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES cognitive_nodes(id) ON DELETE CASCADE,
    target_id UUID REFERENCES cognitive_nodes(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100), -- 'references', 'opposes', 'supports', 'refinement_of'
    weight FLOAT DEFAULT 1.0, -- Dynamic weight (0.0 to 10.0)
    interaction_count INTEGER DEFAULT 1, -- Number of times this link was accessed or confirmed
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON cognitive_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_id ON cognitive_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target_id ON cognitive_edges(target_id);

-- Vector index for fast semantic similarity search
CREATE INDEX IF NOT EXISTS idx_nodes_embedding ON cognitive_nodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to update weights based on interaction
-- Called by the Nexus Agent when a link is confirmed by a user action
CREATE OR REPLACE FUNCTION update_cognitive_weight(edge_id UUID, interaction_delta FLOAT = 0.1)
RETURNS VOID AS $$
BEGIN
    UPDATE cognitive_edges
    SET 
        weight = LEAST(10.0, weight + interaction_delta),
        interaction_count = interaction_count + 1,
        last_interaction_at = CURRENT_TIMESTAMP
    WHERE id = edge_id;
END;
$$ LANGUAGE plpgsql;
