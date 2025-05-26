from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory database
elections = {
    'current_election': None,
    'past_elections': []
}
votes = {
    'total_voters': 10,
    'votes_cast': 0,
    'party_a': 0,
    'party_b': 0,
    'used_ids': [],
    'admin_code': 'ADMIN123',
    'valid_ids': [f'V{i:03d}' for i in range(1, 11)]  # Generates V001-V010
}


@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify({
        'total_voters': votes['total_voters'],
        'votes_cast': votes['votes_cast'],
        'party_a': votes['party_a'],
        'party_b': votes['party_b'],
        'participation': round((votes['votes_cast'] / votes['total_voters']) * 100)
    })

@app.route('/api/validate-voter', methods=['POST'])
def validate_voter():
    data = request.get_json()
    voter_id = data.get('voter_id')
    
    if not voter_id:
        return jsonify({'valid': False, 'message': 'Missing voter ID'}), 400
    
    if voter_id not in votes['valid_ids']:
        return jsonify({'valid': False, 'message': 'Invalid Voter ID'}), 400
    
    if voter_id in votes['used_ids']:
        return jsonify({'valid': True, 'used': True, 'message': 'Voter ID already used'}), 200
    
    return jsonify({'valid': True, 'used': False}), 200

@app.route('/api/vote', methods=['POST'])
def submit_vote():
    data = request.get_json()
    voter_id = data.get('voter_id')
    party = data.get('party')
    
    if not voter_id or not party:
        return jsonify({'success': False, 'message': 'Missing voter ID or party'}), 400
    
    if voter_id in votes['used_ids']:
        return jsonify({'success': False, 'message': 'Voter ID already used'}), 400
    
    if voter_id not in votes['valid_ids']:
        return jsonify({'success': False, 'message': 'Invalid Voter ID'}), 400
    
    # Record vote
    votes['used_ids'].append(voter_id)
    votes['votes_cast'] += 1
    if party == 'A':
        votes['party_a'] += 1
    elif party == 'B':
        votes['party_b'] += 1
    
    return jsonify({'success': True}), 200

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    code = data.get('code')
    
    if code == votes['admin_code']:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid admin code'}), 401
# route for creating a new election
@app.route('/api/elections/create', methods=['POST'])
def create_election():
    data = request.get_json()
    
    required_fields = ['title', 'start_date', 'end_date', 'admin_code', 'candidates']
    if not all(field in data for field in required_fields):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    if data['admin_code'] != votes['admin_code']:
        return jsonify({'success': False, 'message': 'Invalid admin code'}), 401
    
    # Archive current election if exists
    if elections['current_election']:
        elections['past_elections'].append(elections['current_election'])
    
    # Create new election
    elections['current_election'] = {
        'title': data['title'],
        'start_date': data['start_date'],
        'end_date': data['end_date'],
        'candidates': data['candidates'],
        'votes': {candidate['name']: 0 for candidate in data['candidates']},
        'voters': votes['valid_ids'].copy(),
        'used_ids': []
    }
    
    # Reset vote counts
    votes['votes_cast'] = 0
    votes['party_a'] = 0
    votes['party_b'] = 0
    votes['used_ids'] = []
    
    return jsonify({'success': True}), 200
# route for getting the current election details
@app.route('/api/elections/current', methods=['GET'])
def get_current_election():
    if not elections['current_election']:
        return jsonify({'success': False, 'message': 'No active election'}), 404
    
    return jsonify({
        'success': True,
        'election': elections['current_election']
    }), 200
#
@app.route('/api/elections/end', methods=['POST'])
def end_election():
    data = request.get_json()
    
    if data.get('admin_code') != votes['admin_code']:
        return jsonify({'success': False, 'message': 'Invalid admin code'}), 401
    
    if not elections['current_election']:
        return jsonify({'success': False, 'message': 'No active election'}), 400
    
    elections['past_elections'].append(elections['current_election'])
    elections['current_election'] = None
    
    return jsonify({'success': True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)