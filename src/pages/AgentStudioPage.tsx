import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AgentStudioPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/repositories', { replace: true });
  }, [navigate]);

  return null;
}
